import pool from "../config/db_config.js"
import {v4 as uuidv4} from "uuid"

export const upload_photo = async (req,res)=>{
    const {event_code} = req.params
    const {upload_key} = req.body

    try{
        const event = await pool.query(`select id from events 
            where event_code = $1 and upload_key = $2`,[event_code,upload_key]);
        
        if(event.rows.length === 0){
            return res.status(403).json({
                message:"Invalid upload key"
            })
        }

        const photo_id = uuidv4();
        const event_id = event.rows[0].id;
        const image_url = 'https://image01.jpg'

        const result = await pool.query(`insert into photos (id,event_id,image_url)
            values ($1,$2,$3) returning *`,[photo_id,event_id,image_url])

        return res.status(201).json({
            message:"Uploaded photo",
            photo:result.rows[0]
        })

    }catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}