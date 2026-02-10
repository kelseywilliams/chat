import { create } from "zustand";
import { io } from "socket.io-client";


export const useSessionStore = create((set, get) => ({
    user: null,
    socket: null,
    authLost: false,
    setUser: (user) => set({ user }),

    connectSocket: () => {
        if (get().socket) return;
        const socket = io({ path: "/chat/socket.io", withCredentials: true });
        socket.on("user", (user) => set({ user }));
        socket.on("disconnect", () => set({ socket: null }));
        socket.on("unauthorized", () => {
            set({ socket: null, user: null, authLost: true });
            socket.disconnect();
        });
        set({ socket });
    },
}));
