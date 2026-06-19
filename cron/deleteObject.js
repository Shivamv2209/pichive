import pool from "../config/db_config.js"
import {deleteObject} from "../utils/s3.js"

const cronJob = async ()=>{
    try{
        const result = await pool.query(`select p.s3_key from photos p
            join events e on p.event_id = e.id
            where e.expires_at < NOW()`);
         
            for(const row of result.rows){
                await deleteObject(row.s3_key)
            }

            await pool.query(`delete from events where 
                expires_at < NOW()`);
             
             console.log("Expired events deleted successfully")   
    }catch(err){
        console.error("Cron job failed",err)
    }
}

cronJob();