import pool from "../config/db_config.js"
import {v4 as uuidv4} from "uuid"
import {putObjectUrl,getObject} from "../utils/s3.js"

export const upload_photo = async (req,res)=>{

    const {event_code} = req.params
    const {upload_key,files} = req.body

    try{
        const event = await pool.query(`select id from events 
            where event_code = $1 and upload_key = $2`,[event_code,upload_key]);
        
        if(event.rows.length === 0){
            return res.status(403).json({
                message:"Invalid upload key"
            })
        }

        const uploads=[];
        const event_id = event.rows[0].id;
        const allowed_types=["image/jpg","image/jpeg","image/png"]

        for(const file of files){
            
        const photo_id = uuidv4();

        const extension = file.contentType.split('/')[1]
        
        const s3_key = `${event_id}/images/${photo_id}.${extension}`


        if(!allowed_types.includes(file.contentType)){
            return res.status(400).json({
                message:"Invalid content type"
            })
        }


        const upload_url = await putObjectUrl(s3_key,file.contentType)
     
        uploads.push({
            photo_id,
            upload_url,
            s3_key
        })
        }

        return res.status(200).json({
            message:"Upload urls generated",
            uploads
        }
        )

    }catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

export const confirm_upload = async (req,res)=>{
    const {event_code} = req.params;
    const {upload_key,photos} = req.body;
    try{
        const event = await pool.query(`select id from events 
            where event_code = $1 and upload_key = $2`,[event_code,upload_key])

            if(event.rows.length === 0){
                return res.status(403).json({
                    message:"upload did not happen"
                })
            }
        const event_id = event.rows[0].id;
        for(const photo of photos){
            let photo_id = photo.photo_id;
            let s3_key = photo.s3_key;
            await pool.query(`insert into photos (id,event_id,s3_key) values
            ($1,$2,$3)`,[photo_id,event_id,s3_key]);
        } 

        return res.status(200).json({
            message:"all upload done"
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}


export const get_photos = async (req,res)=>{
    try{
        const s3_keys=[];
        const photos = await pool.query(`select * from photos`);
        for(const photo of photos.rows){
            s3_keys.push(photo.s3_key);
        }

        const get_urls = [];
        for(let i=0;i<s3_keys.length;i++){
            const url = await getObject(s3_keys[i]);
            get_urls.push(url)
        }

        return res.status(200).json({
            message:"url generated",
            urls:get_urls
        })

    }catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}
