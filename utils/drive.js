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
    let files =[]
    let pageToken = undefined
    do{
        const response = await drive.files.list({
        q:`'${folderId}' in parents and trashed=false`,
        fields:"nextPageToken,files(id,name,mimeType,size)",
        pageSize:1000,
        pageToken
    });

    files.push(...response.data.files)
    pageToken = response.data.nextPageToken;
    }while(pageToken)

   console.log(`Found ${files.length} files in folder`);

    return files;
}

export const getfileStream = async (fileId)=>{
    const respons = await drive.files.get({
        fileId,
        alt:"media",
    },{
        responseType:"stream",
    }
);

return respons.data
}

export const streamToBuffer = async (stream)=>{
    const chunks =[]
    for await(const chunk of stream){
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}
