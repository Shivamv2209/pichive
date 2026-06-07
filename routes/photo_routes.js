import { upload_photo,confirm_upload,get_photos} from "../controllers/photo_controller.js";
import {Router} from "express"

const route = Router();

route.post("/:event_code",upload_photo);
route.post("/:event_code/confirm",confirm_upload)
route.get("/:event_code",get_photos);

export default route;