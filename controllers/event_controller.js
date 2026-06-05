import {v4 as uuidv4} from "uuid"
import pool from "../config/db_config.js"


const generateUploadKey=()=>{
   const letters  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
   
   let key = "";
   for(let i=0;i<6;i++){
        key += letters[Math.floor(Math.random()*letters.length)]
   }
   return key;
}


export const create_event = async (req,res)=>{
    const id = uuidv4();
    const upload_key = generateUploadKey();
    const {name,event_code} = req.body
    const expires_at = new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
    )
    try{
        const result = await pool.query(`insert into events (id,name,event_code,expires_at,upload_key)
             values ($1,$2,$3,$4,$5) returning *`,[id,name,event_code,expires_at,upload_key]);
        return res.status(201).json({
            message:"Event created successfully",
            event:result.rows[0]
        })
    }catch(err){
        if(err.code === "23505"){
            return res.status(409).json({
                message : "Event code already taken"
            })
        }

        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

export const get_event = async (req,res)=>{
    const {event_code} = req.params
    try{
        const result = await pool.query(`select * from events where event_code = $1`,[event_code])
        if(result.rows.length > 0){
            return res.status(200).json({
                message:"welcome to the Event",
                event:result.rows[0]
            })
        }else{
            return res.status(400).json({
                message:"Event does not exists"
            })
        }
    }catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}
