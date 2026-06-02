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

const io = new Server(server, { cors: corsOptions },);

io.use(socketAuth);

let messageInsertQueue = null;

let client = null;

let online = null;

let active = null;

io.on("connection", async (socket) => {
    // On connection event, get username and add sock id to online redis set
    const username = socket.user.username;
    await client.sadd("online", username);
    logger.info(`${username} connected.`);

    // Emit the username to the client
    socket.emit("user", username);

    // Get the number of total unique online users and active rooms.  Emit to client
    online = await client.scard("online");
    active = await client.scard(`room:rooms`);
    io.emit("user_count", online);
    io.emit("total_rooms", active);

    await roomManager(io, socket, client);
    chatManager(socket, messageInsertQueue);
    socket.on("disconnect", async () => {
        // Remove the user from online users
        await client.srem("online", username);
        // Get all rooms the user was connected to
        const rooms = await client.smembers(`room:${socket.id}`);
        console.log(`rooms=${rooms} socket.id=${socket.id}`);
        // For every room remove the user
        for (const room of rooms) {
            await client.srem(`room:${room}`, socket.id);
            // After removing the user, get the number of remaining connections to room
            const online = await client.scard(`room:${room}`);
            // If there is nobody left in the room, delete it from active rooms
            // and broadcast
            if (online == 0) {
                await client.srem(`room:rooms`, room);
                active = await client.scard(`room:rooms`);
                io.emit("total_rooms", active);
            }
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

const initClient = async () => {
    client = await getRedisClient();
}

export { io, app, server, initMessageInsertQueue, initClient }