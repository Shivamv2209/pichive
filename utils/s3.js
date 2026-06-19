import dotenv from "dotenv"
import {GetObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, S3Client} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

dotenv.config();


const client = new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY,
        secretAccessKey:process.env.AWS_SECRET_KEY
    }
})

export const putObjectUrl = async (key,contentType)=>{
    const command = new PutObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:key,
        ContentType:contentType
    })
 
    const url = await getSignedUrl(client,command)
    return url;
}


const getList = async ()=>{
    const command = new ListObjectsV2Command({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:'/event1'
    })

    const result = await client.send(command)
    result.Contents.map((c)=>{
        console.log(c.Key)
    })
}

export const getObject = async (key)=>{
    const command = new GetObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:key,
        ResponseContentDisposition : "attachment; filename=photo.jpg"
    })

    const url = await getSignedUrl(client,command);
    return url;
}


export const deleteObject = async (key)=>{
    const command = new DeleteObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key:key
    })

    await client.send(command);
}
// const url = await putObjectUrl(`test.jpg`,'image/jpg');

// console.log(url)

// await getList();
// const url = await getObject('event1/images/test.jpg')
// console.log(url)