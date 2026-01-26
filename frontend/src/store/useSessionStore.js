import { create } from "zustand";
import { io } from "socket.io-client";

export const useSessionStore = create((set, get) => ({
  user: null,
  socket: null,

  setUser: (user) => set({ user }),

  connectSocket: () => {
    if (get().socket) return;

    const socket = io("/", { withCredentials: true });

    socket.on("user", (user) => set({ user }));
    socket.on("disconnect", () => set({ socket: null }));

    set({ socket });
  },
}));
