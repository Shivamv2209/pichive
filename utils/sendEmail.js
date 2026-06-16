import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
});

export const sendMail = async (to,subject,text)=>{
   try{
     await transporter.sendMail({
        from:`"PICHIVE" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text
    })
    console.log("Email sent")
   }catch(err){
    console.log("Email failed",err);
    throw err
   }
}