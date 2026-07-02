import { v4 as uuidv4 } from "uuid";
import pool from "../config/db_config.js";
import { sendMail } from "../utils/sendEmail.js";
import { ZipArchive } from "archiver";
import { GetObject } from "../utils/s3.js";
import { eventCreatedEmail } from "../utils/emails/eventCreatedemail.js";

const generateUploadKey = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let key = "";
  for (let i = 0; i < 6; i++) {
    key += letters[Math.floor(Math.random() * letters.length)];
  }
  return key;
};

export const create_event = async (req, res) => {
  const id = uuidv4();
  const upload_key = generateUploadKey();
  const { name, event_code, email } = req.body;
  const expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  try {
    const result = await pool.query(
      `insert into events (id,name,event_code,expires_at,upload_key,owner_email)
             values ($1,$2,$3,$4,$5,$6) returning *`,
      [id, name, event_code, expires_at, upload_key, email],
    );

    if (result.rows.length > 0) {
      try {
        await sendMail(
          email,
          "Your PICHIVE event has been created",
          eventCreatedEmail(name,event_code,upload_key)
        );
      } catch (err) {
        console.log("MAIL error", err);
      }
    }

    return res.status(201).json({
      message: "Event created successfully",
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Event code already taken",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const get_event = async (req, res) => {
  const { event_code } = req.params;
  try {
    const result = await pool.query(
      `select name from events where event_code = $1`,
      [event_code],
    );
    if (result.rows.length > 0) {
      return res.status(200).json({
        message: "welcome to the Event",
        event: result.rows[0],
      });
    } else {
      return res.status(400).json({
        message: "Event does not exists",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const download = async (req, res) => {
  try {
    const { event_code } = req.params;
    const { photo_ids } = req.body;
    if (!Array.isArray(photo_ids) || photo_ids.length === 0) {
      return res.status(400).json({
        message: "No photos selected",
      });
    }
    const event = await pool.query(
      `select id from events where event_code = $1`,
      [event_code],
    );

    if (event.rows.length === 0) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const event_id = event.rows[0].id;
    const photos = await pool.query(
      `select id,s3_key from
      photos where
      event_id = $1 and
      id = ANY($2::uuid[])`,
      [event_id, photo_ids],
    );

    if (photos.rows.length === 0) {
      return res.status(404).json({
        message: "No photos found",
      });
    }

    const archive = new ZipArchive({
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error(err);
      res.destroy(err);
    });

    res.setHeader("Content-Type", "application/zip");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${event_code}-memories.zip"`,
    );

    archive.pipe(res);

    const objects = await Promise.all(
      photos.rows.map((photo) => GetObject(photo.s3_key)),
    );

    for (let i = 0; i < objects.length; i++) {
      const filename = photos.rows[i].s3_key.split("/").pop();

      archive.append(objects[i].Body, {
        name: filename,
      });
    }

    await archive.finalize();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }

    res.destroy(err);
  }
};
