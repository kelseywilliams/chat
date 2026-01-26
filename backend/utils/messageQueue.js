// utils/messageQueue.js
import { Queue } from "bullmq";
import { getBullConnection } from "./bullmqConnect.js";
import { INSERT_QUEUE } from "../config/index.js";
import logger from "../utils/logger.js";

const connection = getBullConnection();
export const messageInsertQueue = new Queue(INSERT_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
