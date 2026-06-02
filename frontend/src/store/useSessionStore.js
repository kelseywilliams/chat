import { create } from "zustand";
import { io } from "socket.io-client";

export const useSessionStore = create((set, get) => ({
    user: null,
    socket: null,
    authLost: false,
    disconnected: true,
    connect_error: false, 
    disconnectReason: null,
    room: null,
    roomCount: 0,
    userCount: 0,
    activeRooms: 0,
    shouldRefetch: false,

    setAuthLost: (authLost) => set({ authLost }),
    setUser: (user) => set({ user }),
    setShouldRefetch: (v) => set({ shouldRefetch: v }),
    
    setRoom: (room) => {
        if (room) {
            sessionStorage.setItem("room", room);
        } else {
            sessionStorage.removeItem("room");
        }
        set({ room });
    },

    connectSocket: () => {
        if (!get().disconnected) return;

        set({ connect_error: false, authLost: false });

        const socket = io({ path: "/chat/socket.io", withCredentials: true });

        socket.on("user", (user) => set({ user }));
        socket.on("room_count", (count) => set({ roomCount: count }));
        socket.on("user_count", (count) => set({ userCount: count }));
        socket.on("total_rooms", (total) => set({ activeRooms: total }));

        socket.on("connect", () => {
            const room = sessionStorage.getItem("room");
            if (room) {
                set({ room }); 
                socket.emit("leaveRoom", { room });
                socket.emit("joinRoom", { room });
                set({ shouldRefetch: true });
            }
            set({ authLost: false, disconnected: false, disconnectReason: null, connect_error: false });
        });

        socket.on("disconnect", (reason) => {
            set({ disconnected: true, disconnectReason: reason });
            console.log(`Disconnected: ${reason}`);
            
            // If the server explicitly kicked us out due to an auth change
            if (reason === "io server disconnect") {
                get().disconnectSocket();
            }
        });

        socket.on("connect_error", (err) => {
            console.log("Connection error:", err.message);
            
            // WIPE EVERYTHING. Leave no trace for the browser cache to read.
            sessionStorage.removeItem("room");
            
            set({ 
                authLost: true, 
                connect_error: true,
                user: null,    // Force UI to drop the authenticated view
                room: null,
                socket: null
            });
            
            // Manually close the broken socket context
            socket.disconnect(); 
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const currentSocket = get().socket;
        if (currentSocket) {
            currentSocket.disconnect();
        }
        
        sessionStorage.removeItem("room");
        
        // Complete state reset
        set({ 
            socket: null, 
            user: null, 
            room: null,
            authLost: false,
            disconnected: true,
            connect_error: false,
            roomCount: 0,
            userCount: 0,
            activeRooms: 0
        });
    },
}));