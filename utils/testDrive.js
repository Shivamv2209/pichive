import { lisFiles } from "./drive.js";
import { getId } from "./getId.js";
import { getfileStream } from "./drive.js";
import { uploadDriveImage } from "./s3.js";
import { streamToBuffer } from "./drive.js"; 
import pool from "../config/db_config.js";
import {v4 as uuidv4} from "uuid"
import {convertHeicToJpeg} from "./heicConvert.js"

// const id = getId(
//   "https://drive.google.com/drive/folders/1XehHlfNSdP9IEZZ6zjaY2_JOAjybpqsc",
// );

// SINGLE FOLDER UPLAOD TO S3 DONE
// const files = await lisFiles(id);
// // console.log(files)

// for (const img of files) {
//   const stream = await getfileStream(img.id);

//   await uploadDriveImage(stream, `drive-test/${img.id}.jpg`, img.mimeType);
// }

// console.log("upload done");

// NESTED FOLDER TO S3 UPLOADS:

const getAllImages = async (folderId) => {
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
    // console.log(folderId)
    const images = await getAllImages(folderId);
    let failed =0;
    const photos = []
    for (const img of images) {
      try{
        if(img.mimeType === "image/heic" || img.mimeType === "image/heif"){
            const stream = await getfileStream(img.id);
            const buffer = await streamToBuffer(stream);
            const jpegBuffer = await convertHeicToJpeg(buffer);
            await uploadDriveImage(jpegBuffer, `${event_id}/${img.id}`, "image/jpeg");
        }else{
            const stream = await getfileStream(img.id);
            await uploadDriveImage(stream, `${event_id}/${img.id}`, img.mimeType);
        }
      photos.push({
        photo_id: uuidv4(),
        s3_key:`${event_id}/${img.id}`,
        google_file_id:img.id,
      })
      }catch(err){
        failed++;
        console.log(`failed image ${img.id}`,err);
        continue;
      }
    }
    return res.status(200).json({
        message:"Uploaded",
        photos,
        total:images.length,
        failed
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
        message:"Internal server error"
    })
  }
};
