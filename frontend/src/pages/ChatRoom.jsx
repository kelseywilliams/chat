import { useMemo, useEffect } from "react";
import { useLocation } from "react-router";
import RoomLobby from "../components/RoomLobby.jsx";
import RoomView from "../components/RoomView";
import { useSessionStore } from "../store/useSessionStore";

function useRoomFromQuery() {
    const location = useLocation();
    return useMemo(() => {
        const params = new URLSearchParams(location.search);
        return (params.get("room") || "").trim();
    }, [location.search]);
}

export default function ChatRoom() {
    const roomName = useRoomFromQuery();
    const socket = useSessionStore(s => s.socket);
    const user = useSessionStore(s => s.user);
    const authLost = useSessionStore(s => s.authLost);
    const disconnected = useSessionStore(s => s.disconnected); // 🌟 FIX: Match state named 'disconnected'
    const disconnectReason = useSessionStore(s => s.disconnectReason);
    const connect_error = useSessionStore(s => s.connect_error);
    const setRoom = useSessionStore(s => s.setRoom);

    useEffect(() => {
        if (roomName) setRoom(roomName);
    }, [roomName]);

    useEffect(() => {
        if (authLost) {
            window.location.href = "/login";
        }
    }, [authLost]);

    if (connect_error) {
        return <div className="p-6 text-red-500 font-bold">Connection error! Gateway refused authentication.</div>;
    }

    if (disconnected && socket) {
        return <div className="p-6 text-yellow-500 font-bold">Disconnected! {disconnectReason}. Reconnecting...</div>;
    }

    if (!roomName) return <RoomLobby />;

    return <RoomView roomName={roomName} socket={socket} user={user} />;
}