import {Queue} from "bullmq"
import { connection } from "../config/redis_config.js"

export const importQueue = new Queue("drive-import",{
    connection
})