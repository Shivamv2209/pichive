import pool from "../config/db_config.js"

export const getJob = async (req,res)=>{
    try{
        const {job_id} = req.params;

        const job = await pool.query(`select status,
            total_images,
            processed_images,
            created_at,
            completed_at from import_jobs where id = $1`,[job_id]);
        
            if(job.rows.length === 0){
                return res.status(404).json({
                    message:"Import job not found"
                })
            }
            const Tj = job.rows[0];
            
            return res.status(200).json({
                Tj
            })
    }catch(err){
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}