import { Server } from "socket.io";
import express from "express";
import http from "http";
import { socketAuth } from "../middleware/socketAuth.js";
import { chatManager } from "../middleware/chatManager.js";
import { roomManager } from "../middleware/roomManager.js";
import logger from "../utils/logger.js";
import { corsOptions } from "../utils/corsOptions.js";
import { getMessageInsertQueue } from "../utils/messageQueue.js";
import { getRedisClient } from "../utils/redisClient.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {cors: corsOptions},);

io.use(socketAuth);

let messageInsertQueue = null;

let client = null;

let online = null;

io.on("connection", async (socket) => {
    // On connection event, get username and add sock id to online redis set
    const username = socket.user.username;
    await client.sadd("online", username);
    logger.info(`${username} connected.`);

    // Emit the username to the client
    socket.emit("user", username);

    online = await client.scard("online");
    io.emit("user_count", online);
    await roomManager(io, socket, client);
    chatManager(socket, messageInsertQueue);
    socket.on("disconnect", async () => {
        await client.srem("online", username);
        const rooms = await client.smembers(`room:${socket.id}`);
        console.log(`rooms=${rooms} socket.id=${socket.id}`);
        for(const room of rooms){
            await client.srem(`room:${room}`, socket.id);
            const online = await client.scard(`room:${room}`);
            io.to(room).emit("room_count", online);
        }
        await client.del(`room:${socket.id}`);
        online = await client.scard("online");
        io.emit("user_count", online);
        logger.info(`${username} disconnected`);
    })
});

// These init functions are necessary since we have to wait for the redis
// client to connect.  This method of wiring the clients allows one redis 
// connection and mutliple clients.  Further clients should also be wired
// in such fashion i.e. set a null variable for the client and await the client
// in an async init arrow function that is awaited at server start independently.

const initMessageInsertQueue = async () => {
    messageInsertQueue = await getMessageInsertQueue();
}

const initClient = async() => {
    client = await getRedisClient();
}

export { io, app, server, initMessageInsertQueue, initClient }