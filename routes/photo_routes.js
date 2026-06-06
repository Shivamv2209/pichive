import { upload_photo } from "../controllers/photo_controller.js";
import {Router} from "express"

const route = Router();

route.post("/:event_code",upload_photo);

export default route;