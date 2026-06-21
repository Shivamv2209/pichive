import { lisFiles } from "./drive.js";
import {getId} from "./getId.js"

const id = getId("https://drive.google.com/drive/folders/1XehHlfNSdP9IEZZ6zjaY2_JOAjybpqsc")
console.log(id)

const files = await lisFiles(id);


console.log(files);