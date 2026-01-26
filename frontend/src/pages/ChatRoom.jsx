import { useMemo } from 'react';
import { useLocation } from 'react-router';
import RoomLobby from '../components/RoomLobby.jsx';
import RoomView from '../components/RoomView';

function useRoomFromQuery() {
  const location = useLocation();
  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("room") || "").trim();
  }, [location.search]);
}

export default function ChatRoom() {
  const roomName = useRoomFromQuery();
  return roomName ? <RoomView roomName={roomName} /> : <RoomLobby />;
}
