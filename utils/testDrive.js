import { lisFiles } from "./drive.js";
import { getId } from "./getId.js";
import fs from "fs";
import { getfileStream } from "./drive.js";
import { uploadDriveImage } from "./s3.js";

const id = getId(
  "https://drive.google.com/drive/folders/1XehHlfNSdP9IEZZ6zjaY2_JOAjybpqsc",
);


// SINGLE FOLDER UPLAOD TO S3 DONE 
// const files = await lisFiles(id);
// // console.log(files)

// for (const img of files) {
//   const stream = await getfileStream(img.id);

//   await uploadDriveImage(stream, `drive-test/${img.id}.jpg`, img.mimeType);
// }

// console.log("upload done");


// NESTED FOLDER TO S3 UPLOADS:


const getAllImages = async (FolderId)=>{

    let images=[]

    const items = await lisFiles(FolderId);

    for (const item of items){
        if(item.mimeType.startsWith("image/")){
            images.push(item)
        }else if (item.mimeType === "application/vnd.google-apps.folder"){
            const childImages = await getAllImages(item.id)
            images.push(...childImages)
        }else{
            continue;
        }
    }

    return images;
}

const images = await getAllImages(id);

console.log(images.length)

