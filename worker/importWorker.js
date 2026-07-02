import { Worker } from "bullmq";
import { connection } from "../config/redis_config.js";
import pool from "../config/db_config.js";
import { getAllImages } from "../utils/testDrive.js";
import { getfileStream } from "../utils/drive.js";
import { streamToBuffer } from "../utils/drive.js";
import { convertHeicToJpeg } from "../utils/heicConvert.js";
import { uploadDriveImage } from "../utils/s3.js";
import { v4 as uuidv4 } from "uuid";
import { embeddingQueue } from "../queues/embeddingsQueue.js";

async function processImage(img, event_id, import_job_id) {
  let extension;
  switch (img.mimeType) {
    case "image/jpeg":
      extension = "jpg";
      break;

    case "image/png":
      extension = "png";
      break;

    case "image/heic":
      extension = "jpg"; // after conversion
      break;
    case "image/heif":
      extension = "jpg"; // after conversion
      break;
    default:
      throw new Error(`Unsupported image type: ${img.mimeType}`);
  }
  const s3_key = `${event_id}/${img.id}.${extension}`;
  if (img.mimeType === "image/heic" || img.mimeType === "image/heif") {
    const stream = await getfileStream(img.id);

    const buffer = await streamToBuffer(stream);
    const jpegBuffer = await convertHeicToJpeg(buffer);

    await uploadDriveImage(jpegBuffer, s3_key, "image/jpeg");
  } else {
    const stream = await getfileStream(img.id);

    await uploadDriveImage(stream, s3_key, img.mimeType);
  }
  await pool.query(
    `insert into photos (id,event_id,s3_key,google_file_id,processing_status)
          values ($1,$2,$3,$4,'pending')`,
    [uuidv4(), event_id, s3_key, img.id],
  );

  await pool.query(
    `update import_jobs
            set processed_images = processed_images+1
            where id = $1`,
    [import_job_id],
  );
}

new Worker(
  "drive-import",
  async (job) => {
    const { import_job_id, event_id, folder_id } = job.data;
    try {
      console.log(`start importing ${import_job_id}`);
      await pool.query(
        `update import_jobs
            set status='running'
            where id = $1`,
        [import_job_id],
      );

      const images = await getAllImages(folder_id);
      const total_images = images.length;
      await pool.query(
        `update import_jobs
        set total_images = $1
        where id = $2`,
        [total_images, import_job_id],
      );

      const BATCH_SIZE = 15;
      let failed = 0;
      for (let i = 0; i < total_images; i += BATCH_SIZE) {
        const batch = images.slice(i, i + BATCH_SIZE);
        const result = await Promise.allSettled(
          batch.map((img) => processImage(img, event_id, import_job_id)),
        );

        for (const res of result) {
          if (res.status === "rejected") {
            failed++;
            console.error(res.reason);
          }
        }
        console.log(
          `Completed ${Math.min(i + BATCH_SIZE, total_images)}/${total_images} uploads`,
        );
      }

      if (total_images > failed) {
        await embeddingQueue.add("generate_embeddings", {
          import_job_id: import_job_id,
          event_id,
        });
      } else {
        await pool.query(
          `update import_jobs
        set status='failed',
        error_message='all uploads failed'
        where id = $1`,
          [import_job_id],
        );
      }
    } catch (err) {
      console.error(err);

      await pool.query(
        `update import_jobs
          set status = 'failed'
          where id = $1`,
        [import_job_id],
      );

      throw err;
    }
  },
  {
    connection,
  },
);

console.log("Import worker started");
