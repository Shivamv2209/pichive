import { Queue } from "bullmq";
import { connection } from "../config/redis_config.js";

export const embeddingQueue = new Queue("embedding",{
    connection
})