import { Server } from "socket.io";
import express from "express";
import http from "http";
import { socketAuth } from "../middleware/socketAuth.js";
import { chatManager } from "../middleware/chatManager.js";
import { roomManager } from "../middleware/roomManager.js";
import logger from "../utils/logger.js";
import { corsOptions } from "../utils/corsOptions.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: corsOptions });

io.use(socketAuth);

io.on("connection", (socket) => {
    const username = socket.user.username;

    socket.emit("user", socket.user);
    roomManager(socket);
    chatManager(socket);

    socket.on("disconnect", () => {
        logger.info("A user disconnected", username);
    })
})

export { io, app, server }