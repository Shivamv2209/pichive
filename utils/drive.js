import {google} from "googleapis"
import dotenv from "dotenv"

dotenv.config();


const auth = new google.auth.GoogleAuth({
    credentials:{
        client_email:process.env.CLIENT_EMAIL,
        private_key:process.env.PRIVATE_KEY.replace(/\\n/g,"\n"),
    },
    scopes:["https://www.googleapis.com/auth/drive.readonly"]
});

const drive = google.drive({
    version:"v3",
    auth,
});

export const lisFiles = async (folderId) =>{
    const response = await drive.files.list({
        q:`'${folderId}' in parents and trashed=false`,
        fields:"files(id,name,mimeType)",
    });

    return response.data.files;
}
