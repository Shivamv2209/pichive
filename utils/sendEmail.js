import {Resend} from "resend"
import dotenv from "dotenv"

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendMail = async (to,subject,html)=>{
   try{
     await resend.emails.send({
        from:"PICHIVE <hello@pichive.in>",
        to,
        subject,
        html:html
    })
   }catch(err){
    console.log("Email failed",err);
    throw err
   }
}