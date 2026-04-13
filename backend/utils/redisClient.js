import IORedis from "ioredis";
import logger from "../utils/logger.js";
import { REDIS_URI } from "../config/index.js";

let client = null;
let connecting = null;

export const connectRedis = async () => {
    if (client?.status == "ready") return client;
    if (connecting) return connecting;

    connecting = (async () => {
        client = new IORedis(REDIS_URI, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            connectTimeout: 10_000,
            retryStrategy: (retries) => {
                // Keep trying, with capped backoff.
                const delay = Math.min(50 * 2 ** retries, 3000);
                if (retries === 0) logger.warn("Redis reconnecting...");
                if (retries % 10 === 0) logger.warn(`Redis reconnect attempts: ${retries}`);
                return delay;
            },
        });

        client.on("error", (err) => logger.info("Redis error:", err));
        client.on("connect", () => logger.info("Redis TCP connected"));
        client.on("ready", () => logger.info("Redis ready"));
        client.on("end", () => logger.warn("Redis connection ended"));

        await new Promise((resolve, reject) => {
            client.once("ready", resolve);
            client.once("error", reject);
        });

        // Initalize the client by removing the online users and room set
        client.del("online");
        const keys = await client.keys("room:*");
        if (keys.length) await client.del(...keys);

        return client;

    })();

    try {
        return await connecting;
    } finally {
        connecting = null;
    }
};

export const getRedisClient = async () => {
    if (!client) throw new Error("Redis client not initialized. Call connectRedis() first.");
    if (client.status !== "ready") throw new Error("Redis client not ready.");
    return client;
};

export const disconnectRedis = async () => {
    if (!client) return;

    const c = client;
    client = null;

    // Quit with timeout to avoid hanging shutdown.
    await Promise.race([
        c.quit(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Redis quit timeout")), 3000)),
    ]).catch((err) => {
        logger.warn("Redis quit failed, forcing disconnect:", err);
        try { c.disconnect(); } catch { }
    });
};
