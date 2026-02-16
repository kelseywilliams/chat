import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const REDIS_PWD = fs.readFileSync("/run/secrets/redis_secret", "utf-8").trim();
const REDIS_URI = `redis://bullmq:${REDIS_PWD}@redis:6379`;
const INSERT_QUEUE = "message-insert";
let PROTOCOL = "http"
let API_DOMAIN = "proxy:80/api"
if (process.env.NODE_ENV == "production"){
    PROTOCOL = "https";
    API_DOMAIN = "api.kelseywilliams.co";
}
const PORT = 3029;

export {
    REDIS_URI,
    INSERT_QUEUE,
    PORT,
    PROTOCOL,
    API_DOMAIN
};