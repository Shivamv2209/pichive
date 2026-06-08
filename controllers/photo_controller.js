import pool from "../config/db_config.js"
import {v4 as uuidv4} from "uuid"
import {putObjectUrl,getObject} from "../utils/s3.js"
import {spawn} from "child_process"

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
        const insertedPhotos = []
        for(const photo of photos){
            let photo_id = photo.photo_id;
            let s3_key = photo.s3_key;
            await pool.query(`insert into photos (id,event_id,s3_key) values
            ($1,$2,$3)`,[photo_id,event_id,s3_key]);

            insertedPhotos.push({
                photo_id:photo_id,
                s3_key:s3_key
            })
        }
        
        const new_photos=[]
        for(const item of insertedPhotos){
            let photo_id = item.photo_id
            let s3_key = item.s3_key
            const url = await getObject(s3_key)
            new_photos.push({
                photo_id:photo_id,
                url:url
            })
        }

        const py = spawn('python3',['worker/embeddings.py'])
        py.stdin.write(JSON.stringify(new_photos))
        py.stdin.end();

        let output = ""

        py.stdout.on("data",(data)=>{
            output+=data.toString();
        })

        py.stderr.on("data",(data)=>{
            console.error(data.toString())
        })

        py.on("close",async ()=>{
            // console.log(output)
            const embeddings = JSON.parse(output);
            console.log(embeddings)

            for(const item of embeddings){
                await pool.query(`insert into face_embeddings (id,photo_id,embeddings,face_index) values
                ($1,$2,$3,$4)`,[uuidv4(),item.photo_id,item.embedding,item.face_index])
            }
        return res.status(200).json({
            message:"all upload done",
        })
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
