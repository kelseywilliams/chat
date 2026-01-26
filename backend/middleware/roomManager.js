import { sanatizeRoom } from "../utils/utils.js";

export function roomManager(socket){
    socket.on("joinRoom", ({ room }, ack) => {
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
    socket.data.room = name; // track current room if you want
    return ack?.(
        { 
            ok: true, 
            room: name 
        }
    );
  });

  socket.on("leaveRoom", ({ room }, ack) => {
    const name = sanatizeRoom(room);
    if (!name) return ack?.(
        { 
            ok: false,
            error: "Invalid room name" 
        }
    );

    socket.leave(name);
    if (socket.data.room === name) {
        socket.data.room = null;
    }
    return ack?.(
        {
             ok: true, 
             room: name 
            }
        );
  });
}