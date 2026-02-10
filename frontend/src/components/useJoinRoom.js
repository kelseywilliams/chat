import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSessionStore } from '../store/useSessionStore.js'

function emitJoinRoom(socket, roomName, { timeoutMs = 2500 } = {}) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ ok: false, ack: null, timedOut: true });
    }, timeoutMs);

    socket.emit("joinRoom", { room: roomName }, (ack) => {
      clearTimeout(timer);
      resolve({ ok: true, ack, timedOut: false });
    });
  });
}

export function useJoinRoom() {
    const navigate = useNavigate();
    const socket = useSessionStore((s) => s.socket);

    const [error, setError] = useState("");
    const [isJoining, setIsJoining] = useState(false);

    const joinRoom = useCallback(
        async (roomNameRaw) => {
            const roomName = (roomNameRaw || "").trim();

            if (!roomName) {
                setError("Room name is required.");
                return false;
            }
            if (!socket) {
                setError("Socket not connected yet");
                return false;
            }

            setError("");
            setIsJoining(true);
            try {
                await emitJoinRoom(socket, roomName);
                navigate(`/chat?room=${encodeURIComponent(roomName)}`);
                return true;
            } catch {
                setError("Failed to join room.");
                return false;
            } finally {
                setIsJoining(false);
            }
        },
        [socket, navigate]
    );

    return { joinRoom, error, isJoining, hasSocket: !!socket };
}