import pkg from 'bullmq';
const { Worker } = pkg; // QueueScheduler removed
import axios from "axios";
import { getBullConnection } from "../utils/bullmqConnect.js";
import logger from "../utils/logger.js";
import { INSERT_QUEUE, PROTOCOL, API_DOMAIN } from "../config/index.js";

const API = `${PROTOCOL}://${API_DOMAIN}`;
export default async function startMessageInsertWorker(io) {
  if (!io) throw new Error("io is required");
  
  const connection = getBullConnection();

  // In BullMQ 4+, Worker handles scheduling/stalled jobs automatically 
  // as long as you have a connection.
  const worker = new Worker(
    INSERT_QUEUE,
    async (job) => {
      const { cookie, ulid, room, username, content } = job.data;

      if (!cookie || !ulid || !room || !username || !content) {
        throw new Error(`Invalid job payload: ${JSON.stringify(job.data)}`);
      }

      const chat = await axios.post(
        `${API}/chat/new`,
        { ulid, room, username, content },
        {
          headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
          },
          timeout: 10_000,
        }
      );

      return chat.data;
    },
    {
      connection,
      concurrency: 10,
    }
  );

  worker.on("completed", (job, result) => {
    const { room } = job.data;
    // Emit the actual result from the backend
    io.to(room).emit("new", result);
    logger.info(`Message persisted and emitted to room=${room} job=${job.id}`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Worker failed job=${job?.id} err=${err?.message}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    try {
      logger.info("Closing worker...");
      await worker.close();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}