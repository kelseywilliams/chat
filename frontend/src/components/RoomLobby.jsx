import { useMemo, useState } from 'react'
import { useJoinRoom } from './useJoinRoom.js'

export default function RoomLobby(){
    const PUBLIC_ROOMS = ["General", "Gaming", "Movies"];
    const { joinRoom, error, isJoining, hasSocket } = useJoinRoom();
    const [roomInput, setRoomInput] = useState("");

    const rooms = useMemo(() => PUBLIC_ROOMS, []);

    const onSubmit = async(e) => {
        e.preventDefault();
        await joinRoom(roomInput);
    };

    return (
        <div className="card w-full max-w-xl bg-base-100 shadow-xl">
            <div className="card-body gap-6">
            <h1 className="card-title justify-center text-2xl font-bold">Join a room</h1>

            <form onSubmit={onSubmit} className="form-control gap-3">
                <input
                required
                type="text"
                placeholder="Enter a room name..."
                className="input input-bordered w-full text-center"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                maxLength={64}
                disabled={isJoining}
                />

                <button className="btn btn-primary" disabled={isJoining || !hasSocket}>
                {isJoining ? <span className="loading loading-spinner" /> : "Join Room"}
                </button>

                {/* Cleaner logic gates using && */}
                {error && (
                <div className="alert alert-error py-2 text-sm">
                    <span>{error}</span>
                </div>
                )}

                {!hasSocket && (
                <p className="text-center text-xs opacity-50 animate-pulse">
                    Establishing connection...
                </p>
                )}
            </form>

            {rooms.length > 0 && (
                <>
                <div className="divider text-xs uppercase tracking-widest opacity-50">Public Rooms</div>
                <div className="grid grid-cols-1 gap-2">
                    {rooms.map((room) => (
                    <button
                        key={room}
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => joinRoom(room)}
                        disabled={isJoining}
                    >
                        {room}
                    </button>
                    ))}
                </div>
                </>
            )}
            </div>
        </div>
    );
}