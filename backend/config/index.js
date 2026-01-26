import fs from "fs";

const REDIS_PWD = fs.readFileSync("/run/secrets/redis_secret", "utf-8").trim();
const PUBLIC_KEY = fs.readFileSync("/run/secrets/jwt_public", "utf-8").trim();
const REDIS_URI = `redis://chat:${REDIS_PWD}@redis:6379`;
const INSERT_QUEUE = "message-insert";
const PORT = 3029;

export {
    PUBLIC_KEY,
    REDIS_URI,
    INSERT_QUEUE,
    PORT
};