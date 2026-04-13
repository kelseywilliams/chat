import { sanatizeRoom } from "../utils/utils.js";
import logger from "../utils/logger.js";

export async function roomManager(io, socket, client) {
    socket.on("joinRoom", async ({ room }, ack) => {
        const name = sanatizeRoom(room);
        if (!name) {
            return ack?.(
                {
                    ok: false,
                    error: "Invalid room name"
                }
            );
        }

        socket.join(name);
        // Collect the sockets connected to a room and the rooms the socket is
        // connect to.
        await client.sadd(`room:${name}`, socket.id);
        await client.sadd(`room:${socket.id}`, name);
        // Get the number of socket connections to the room
        const roomSize = await client.scard(`room:${name}`);
        io.to(name).emit("room_count", roomSize);
        logger.info(`${socket.user.username} joined room ${name}`);
        return ack?.(
            {
                ok: true,
                room: name
            }
        );
    });

    socket.on("leaveRoom", async ({ room }, ack) => {
        const name = sanatizeRoom(room);
        if (!name) return ack?.(
            {
                ok: false,
                error: "Invalid room name"
            }
        );

        socket.leave(name);
        await client.srem(`room:${name}`, socket.id);
        await client.srem(`room:${socket.id}`, name);
        const roomSize = await client.scard(`room:${name}`);
        io.to(name).emit("room_count", roomSize);
        return ack?.(
            {
                ok: true,
                room: name
            }
        );
    });
}