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


    // Login doesn't work
    useEffect(() => {
        if (authLost) {
            window.location.href = "/login";
        }
    }, [authLost]);

    if (!roomName) return <RoomLobby />;

    if (!socket) return <div>Connecting…</div>;

    return <RoomView roomName={roomName} socket={socket} user={user} />;
}
