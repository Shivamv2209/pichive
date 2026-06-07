import dotenv from "dotenv"
import {GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
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
        Bucket:'pichive-images',
        Key:key,
        ContentType:contentType
    })
 
    const url = await getSignedUrl(client,command)
    return url;
}


const getList = async ()=>{
    const command = new ListObjectsV2Command({
        Bucket:'pichive-images',
        Key:'/event1'
    })

    const result = await client.send(command)
    result.Contents.map((c)=>{
        console.log(c.Key)
    })
}

export const getObject = async (key)=>{
    const command = new GetObjectCommand({
        Bucket:'pichive-images',
        Key:key
    })

    const url = await getSignedUrl(client,command);
    return url;
}

// const url = await putObjectUrl(`test.jpg`,'image/jpg');

// console.log(url)

// await getList();
// const url = await getObject('event1/images/test.jpg')
// console.log(url)