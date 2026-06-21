import { lisFiles } from "./drive.js";
import { getId } from "./getId.js";
import fs from "fs";
import { getfileStream } from "./drive.js";
import { uploadDriveImage } from "./s3.js";

const id = getId(
  "https://drive.google.com/drive/folders/1XehHlfNSdP9IEZZ6zjaY2_JOAjybpqsc",
);

const files = await lisFiles(id);
// console.log(files)

for (const img of files) {
  const stream = await getfileStream(img.id);

  await uploadDriveImage(stream, `drive-test/${img.id}.jpg`, img.mimeType);
}

console.log("upload done");
