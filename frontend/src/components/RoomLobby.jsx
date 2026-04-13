import { useState } from 'react'
import { useJoinRoom } from './useJoinRoom.js'
import Navbar from './NavBar.jsx'
import { useSessionStore } from '../store/useSessionStore.js'

const PUBLIC_ROOMS = ['General', 'Gaming', 'Movies']

export default function RoomLobby() {
    const userCount = useSessionStore((state) => state.userCount);
    const { joinRoom, error, isJoining, hasSocket } = useJoinRoom()
    const [roomInput, setRoomInput] = useState('')

    const onSubmit = (e) => {
        e.preventDefault()
        joinRoom(roomInput)
    }

    return (
        <div className="h-screen flex flex-col">
            <Navbar />

            <main className="max-w-lg mx-auto w-full px-6 py-12">
                <h1 className="text-2xl font-bold mb-8">Chat</h1>
                <div className="text-xs opacity-40 mb-2">{userCount} online</div>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-10">
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
                    <button className="btn btn-neutral" disabled={isJoining || !hasSocket}>
                        {isJoining ? <span className="loading loading-spinner loading-sm" /> : 'Join Room'}
                    </button>
                    {error && <p className="text-error text-sm">{error}</p>}
                    {!hasSocket && <p className="text-xs opacity-50 animate-pulse">Connecting...</p>}
                </form>

                <p className="text-xs uppercase tracking-widest text-base-content/40 mb-3">Public Rooms</p>
                <div className="border-t border-base-300">
                    {PUBLIC_ROOMS.map((room) => (
                        <button
                            key={room}
                            className="w-full text-left py-3 border-b border-base-300 hover:text-primary transition-colors disabled:opacity-40"
                            onClick={() => joinRoom(room)}
                            disabled={isJoining}
                        >
                            {room}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    )
}
