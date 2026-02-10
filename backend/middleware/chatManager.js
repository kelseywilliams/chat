import { messageInsertQueue } from "../utils/messageQueue.js";
import logger from "../utils/logger.js";
import { sanatizeContent, sanatizeRoom } from "../utils/utils.js";
import { ulid } from "ulid";
import secure from "./secure.js";

export function chatManager(socket){
    socket.on("send", async ({ room, content }, ack) => {
        secure(socket);
        const cookie = socket.request.headers.cookie;
        if (!cookie) {
            logger.error("Cookie not included in socket request.");
            return ack?.(
                { ok: false, error: "Authorization token must be provided" }
            )
        }
        if (!content || !room) {
            return ack?.(
                { ok: false, error: "Invalid room or message"});
        } 

        const cleanRoom = sanatizeRoom(room);
        const cleanContent = sanatizeContent(content);
        if (!cleanContent || !cleanRoom) {
            return ack?.(
                { ok: false, error: "Invalid room or message"});
        } 

        if (!socket.rooms.has(cleanRoom)) {
            return ack?.(
                { ok: false, error: "User not in this room" });
        }
        
        const username = socket.user?.username;

        if (!username) {
            logger.error("User is not authenticated.");
            return ack?.(
                { ok: false, error: "User not authenticated."}
            )
        }
        const id = ulid();

        try {
            await messageInsertQueue.add("insertMessage", {
                cookie,
                ulid: id,
                room: cleanRoom,
                username,
                content: cleanContent 
            });
            
            // Send success acknowledgment
            ack?.({ ok: true });
        } catch (error) {
            logger.error("Failed to queue message:", error);
            ack?.({ ok: false, error: "Failed to queue message" });
        }
    })
}