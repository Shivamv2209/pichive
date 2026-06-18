// import nodemailer from "nodemailer"
import {Resend} from "resend"
import dotenv from "dotenv"

dotenv.config();

// const transporter = nodemailer.createTransport({
//     service:"gmail",
//     auth:{
//         user:process.env.EMAIL_USER,
//         pass:process.env.EMAIL_PASS
//     }
// });

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendMail = async (to,subject,text)=>{
   try{
     await resend.emails.send({
        from:"PICHIVE <hello@pichive.in>",
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