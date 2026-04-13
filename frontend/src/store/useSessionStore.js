import { create } from "zustand";
import { io } from "socket.io-client";


export const useSessionStore = create((set, get) => ({
    user: null,
    socket: null,
    authLost: false,
    disconnected: true,
    connect_error: true,
    disconnectReason: null,
    room: null,
    roomCount: 0,
    userCount: 0,
    activeRooms: 0,
    setAuthLost: (authLost) => set({ authLost }),
    setUser: (user) => set({ user }),
    setRoom: (room) => {
        sessionStorage.setItem("room", room);
        set({ room });
    },
    shouldRefetch: false,
    setShouldRefetch: (v) => set({ shouldRefetch: v }),


    connectSocket: () => {
        if (get().socket) return;
        const socket = io({ path: "/chat/socket.io", withCredentials: true });
        socket.on("user", (user) => set({ user: user }));
        socket.on("room_count", (count) => set({ roomCount: count }));
        socket.on("user_count", (count) => set({ userCount: count }));
        socket.on("total_rooms", (total) => set({ activeRooms: total }));
        // upon connection, set all disconnect and error flags to false
        socket.on("connect", () => {
            const room = sessionStorage.getItem("room");
            if (room) {
                set({ room }); // restore to store if it came from sessionStorage
                socket.emit("leaveRoom", { room })
                socket.emit("joinRoom", { room });
                set({ shouldRefetch: true });
            }
            set({ authLost: false, disconnected: false, disconnectReason: null, connect_error: false });
        });
        socket.on("disconnect", (reason) => {
            set({ disconnected: true, disconnectReason: reason });
            console.log(`Disconnected: ${reason}`);
        });
        // This will likely trigger on expired token 
        socket.on("connect_error", () => {
            set({ authLost: true, connect_error: true });
            console.log("Connection error");
        });
        set({ socket });
    },
    disconnectSocket: () => {
        if (!get().socket) return;
        else socket.disconnect();
        set({ socket: null, user: null, room: null });
    },
}));
