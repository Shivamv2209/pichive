import { Router } from "express"
import {create_event,get_event} from "../controllers/event_controller.js"

const route = Router();

route.post('/create-event',create_event);
route.get('/:event_code',get_event);

export default route;