// utils/messageQueue.js
import { Queue } from "bullmq";
import { getRedisClient } from "../utils/redisClient.js";
import { INSERT_QUEUE } from "../config/index.js";

let messageInsertQueue = null;

export const getMessageInsertQueue = async () => {
    if (messageInsertQueue) return messageInsertQueue;
    const connection = await getRedisClient();
    messageInsertQueue = new Queue(INSERT_QUEUE, {
        connection,
        defaultJobOptions: {
            attempts: 5,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
        },
    });
    return messageInsertQueue;
}