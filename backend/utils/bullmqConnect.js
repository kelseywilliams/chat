import IORedis from "ioredis";
import { REDIS_URI } from "../config/index.js";
import logger from "../utils/logger.js";

let connection;

export const getBullConnection = () => {
  if (!connection) {
    connection = new IORedis(REDIS_URI, {
      maxRetriesPerRequest: null, // BullMQ recommendation
      enableReadyCheck: false,    // often recommended for queues
    });

    connection.on("error", (e) => logger.error("BullMQ Redis error:", e));
    connection.on("connect", () => logger.info("BullMQ Redis connected"));
  }
  return connection;
};
