import { Router } from "express";
import { getJob } from "../controllers/job_controller.js";

const route = Router();

route.get("/:job_id",getJob)

export default route;