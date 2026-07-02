import { Worker } from "bullmq";
import { connection } from "../config/redis_config.js";
import pool from "../config/db_config.js";
import { getObject } from "../utils/s3.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "../utils/sendEmail.js";
import { importCompletedEmail } from "../utils/emails/importCompletedEmail.js";

new Worker(
  "embedding",
  async (job) => {
    const { import_job_id, event_id } = job.data;
    try {
      console.log(`the job is ${import_job_id}`);

      const photos = await pool.query(
        `select id,s3_key 
            from photos
            where processing_status = 'pending'
            and event_id = $1`,
        [event_id],
      );

      if (photos.rows.length === 0) {
        console.log("No pending photos");
        return;
      }

      await pool.query(
        `update import_jobs
            set status = 'embedding'
            where id = $1`,
        [import_job_id],
      );

      const BATCH_SIZE = 50;

      for (let i = 0; i < photos.rows.length; i += BATCH_SIZE) {
        const batch = photos.rows.slice(i, i + BATCH_SIZE);
        const ids = batch.map((photo) => photo.id);
        await pool.query(
          `update photos
            set processing_status = 'processing'
            where id = ANY($1)`,
          [ids],
        );
        const batch_photos = [];
        for (const photo of batch) {
          const url = await getObject(photo.s3_key);

          batch_photos.push({
            photo_id: photo.id,
            url,
          });
        }

        const response = await axios.post(
          `${process.env.WORKER_URL}/generate-embeddings`,
          batch_photos,
        );
        const embeddings = response.data.embeddings;
        for (const item of embeddings) {
          await pool.query(
            `insert into face_embeddings (id,photo_id,embeddings,face_index) values
      ($1,$2,$3,$4)`,
            [uuidv4(), item.photo_id, item.embedding, item.face_index],
          );
        }

        await pool.query(
          `update photos
            set processing_status = 'completed'
            where id = ANY($1)`,
          [ids],
        );
      }

      await pool.query(
        `update import_jobs
            set status = 'completed',
            completed_at = NOW()
            where id = $1`,
        [import_job_id],
      );

      const event = await pool.query(
        `select name,event_code,owner_email
            from events
            where id = $1`,
        [event_id],
      );

      try {
        await sendMail(
          event.rows[0].owner_email,
          "Your PICHIVE event is Ready",
          importCompletedEmail(event.rows[0].name, event.rows[0].event_code),
        );
      } catch (err) {
        console.error("email not sent", err);
      }
    } catch (err) {
      console.error(err);
      await pool.query(
        `
        UPDATE photos
        SET processing_status = 'pending'
        WHERE event_id = $1
        AND processing_status = 'processing'
    `,
        [event_id],
      );

      await pool.query(
        `
        UPDATE import_jobs
        SET status = 'failed'
        WHERE id = $1
    `,
        [import_job_id],
      );
      throw err;
    }
  },
  {
    connection,
  },
);

console.log("Embedding worker started");
