import startMessageInsertWorker from "./workers/messageInsertWorker.js"
import logger from "./utils/logger.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import path from "path";
import { fileURLToPath } from "url";
import { io, app, server } from "./lib/socket.js";
import { corsOptions } from "./utils/corsOptions.js";
import { PORT } from "./config/index.js";

const __filename = fileURLToPath(import.meta.url); // TODO WHAT IS THIS
const __dirname = path.dirname(__filename);

app.use(cors(corsOptions));
app.disable("x-powered-by"); // Reduce fingerprinting
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const distDir = path.join(__dirname, "../frontend/dist");

// Serve built files under /chat
app.use("/chat", express.static(distDir, { index: false }));

// SPA fallback under /chat (must be AFTER static)
app.get(/^\/chat(\/(?!assets\/).*)?$/, (_, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});



server.listen(PORT, () => {
    startMessageInsertWorker(io);
    logger.info(`Server listening on port ${PORT}`);
});