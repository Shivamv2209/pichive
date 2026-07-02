import { lisFiles } from "./drive.js";
import { getId } from "./getId.js";
import pool from "../config/db_config.js";
import { v4 as uuidv4 } from "uuid";
import { importQueue } from "../queues/importQueue.js";
// NESTED FOLDER TO S3 UPLOADS:

export const getAllImages = async (folderId) => {
  let images = [];

  const items = await lisFiles(folderId);

  for (const item of items) {
    if (item.mimeType.startsWith("image/")) {
      images.push(item);
    } else if (item.mimeType === "application/vnd.google-apps.folder") {
      const childImages = await getAllImages(item.id);
      images.push(...childImages);
    } else {
      continue;
    }
  }

  return images;
};

export const upload_drive_url = async (req, res) => {
  const { event_code } = req.params;
  const { upload_key, url } = req.body;
  try {
    const event = await pool.query(
      `select id from events where event_code = $1 and upload_key = $2`,
      [event_code, upload_key],
    );
    if (event.rows.length === 0) {
      return res.status(403).json({
        message: "Invalid upload key",
      });
    }

    const folderId = getId(url);
    const event_id = event.rows[0].id;
    const id = uuidv4();
    await pool.query(`insert into import_jobs (id,event_id,drive_folder_id)
      values ($1,$2,$3)`,[id,event_id,folderId]);

    await importQueue.add("driver-import",{
      import_job_id:id,event_id,folder_id:folderId
    })

    return res.status(200).json({
      message:"Import started",
      id
    });
    
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
