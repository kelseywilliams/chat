import { useState, useMemo } from 'react'
import { useJoinRoom } from './useJoinRoom.js'
import Navbar from './NavBar.jsx'
import { useSessionStore } from '../store/useSessionStore.js'

const randomHash = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export default function RoomLobby() {
    const userCount = useSessionStore((state) => state.userCount);
    const activeRooms = useSessionStore((s) => s.activeRooms);
    const socket = useSessionStore((s) => s.socket);
    const { joinRoom, error, isJoining, hasSocket } = useJoinRoom()
    const [roomInput, setRoomInput] = useState('')
    const publicRooms = useMemo(() => Array.from({ length: 4 }, randomHash), []);

    const onSubmit = (e) => {
        e.preventDefault()
        joinRoom(roomInput)
    }

    const handleRandomRoom = () => {
        socket.emit("active_rooms", (rooms) => {
            if (rooms && rooms.length > 0) {
                const pick = rooms[Math.floor(Math.random() * rooms.length)];
                console.log(pick);
                joinRoom(pick);
            } else {
                joinRoom(randomHash()); 
            }
        });
    }

    return (
        <div className="h-screen flex flex-col">
            <Navbar />

            <main className="max-w-lg mx-auto w-full px-6 py-12">
                <h1 className="text-2xl font-bold mb-8">Chat</h1>
                <p className="text-xs tracking-widest text-base-content/40 mb-3">Join a room of your choosing or enter a random active room.</p>
                <div className="text-xs mb-2">{userCount} online | {activeRooms} active rooms</div>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <input
                        required
                        type="text"
                        placeholder="Room name..."
                        className="input input-bordered w-full"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        maxLength={64}
                        disabled={isJoining}
                    />
                    <button className="btn btn-secondary" disabled={isJoining || !hasSocket}>
                        {isJoining ? <span className="loading loading-spinner loading-sm" /> : 'Join'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-accent"
                        disabled={isJoining || !hasSocket}
                        onClick={handleRandomRoom}
                    >
                        Random Room
                    </button>
                    {error && <p className="text-error text-sm">{error}</p>}
                    {!hasSocket && <p className="text-xs opacity-50 animate-pulse">Connecting...</p>}
                </form>

                {/* <p className="text-xs uppercase tracking-widest text-base-content/40 mb-3">Public Rooms</p>
                <div className="border-t border-base-300">
                    {publicRooms.map((room) => (
                        <button
                            key={room}
                            className="w-full text-left py-3 border-b border-base-300 hover:text-primary transition-colors disabled:opacity-40 font-mono"
                            onClick={() => joinRoom(room)}
                            disabled={isJoining}
                        >
                            {room}
                        </button>
                    ))}
                </div> */}
            </main>
        </div>
    )
}