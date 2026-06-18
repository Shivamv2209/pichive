import pool from "../config/db_config.js";
import multer from "multer";
import { getObject } from "../utils/s3.js";
import axios from "axios";
import dotenv from "dotenv"

dotenv.config();

const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const search_photos = async (req, res) => {
  try {
    const { event_code } = req.params;
    const selfie = req.file;

    const event = await pool.query(
      "select id from events where event_code = $1",
      [event_code],
    );

    const event_id = event.rows[0].id;

    const result = await pool.query(
      `select fe.photo_id,fe.embeddings 
            from face_embeddings fe
            join photos p
            on fe.photo_id = p.id
            where p.event_id = $1`,
      [event_id],
    );

    const face_embeddings = [];
    for (const r of result.rows) {
      face_embeddings.push({
        photo_id: r.photo_id,
        embedding: r.embeddings,
      });
    }

    const response = await axios.post(
      `${process.env.WORKER_URL}/search-selfie`,{
        selfie:Array.from(selfie.buffer),
        face_embeddings:face_embeddings
      }
    )

    let ids = []

    ids = response.data.photo_ids

    const urls = []
    for(const id of ids){
      const result = await pool.query(`select s3_key from photos where id=$1`,[id]);
      const s3_key = result.rows[0].s3_key;
      
      const url = await getObject(s3_key)
      urls.push({
        get_url:url,
      });
    }

    return res.status(200).json({
      message:"urls reached",
      urls
    })
    
  } catch (err) {
    return res.status(500).json({
      messaege: "Internal server error",
    });
  }
};
