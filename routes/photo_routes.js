import { upload_photo,confirm_upload,get_photos} from "../controllers/photo_controller.js";
import { upload_drive_url } from "../utils/testDrive.js";
import {Router} from "express"

const route = Router();

route.post("/:event_code",upload_photo);
route.post("/:event_code/confirm",confirm_upload)
route.get("/:event_code",get_photos);
route.post("/url/:event_code",upload_drive_url);

export default route;