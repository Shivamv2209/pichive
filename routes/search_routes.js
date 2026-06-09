import {Router} from "express"
import { upload } from "../controllers/search_controller.js";
import { search_photos } from "../controllers/search_controller.js";

const route = Router();

route.post("/:event_code",upload.single('selfie'),search_photos)

export default route;