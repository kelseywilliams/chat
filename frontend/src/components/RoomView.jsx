import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { PROTOCOL, API_DOMAIN } from '../config/index.js'
import Navbar from './NavBar.jsx'
import { useSessionStore } from '../store/useSessionStore.js'
import { ulid } from 'ulid'

export default function RoomView({ roomName, user, socket }) {
    const roomCount = useSessionStore((state) => state.roomCount);
    const shouldRefetch = useSessionStore((s) => s.shouldRefetch);
    const setShouldRefetch = useSessionStore((s) => s.setShouldRefetch);
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingOlder, setIsLoadingOlder] = useState(false)
    const [hasMoreMessages, setHasMoreMessages] = useState(true)

    const containerRef = useRef(null)
    const navigate = useNavigate()
    const prevScrollHeight = useRef(0)
    const isAtBottom = useRef(true)
    const didInitialScroll = useRef(false)

    // Load initial messages
    useEffect(() => {
        if (!roomName) return
        setIsLoading(true)
        axios.post(`${PROTOCOL}://${API_DOMAIN}/chat/read`, { room: roomName, last_seen_id: null }, { withCredentials: true })
            .then((res) => {
                const chats = res.data?.chats
                setMessages(Array.isArray(chats) ? chats : [])
                setHasMoreMessages(chats?.length === 100)
            })
            .catch(() => setError('Failed to load messages'))
            .finally(() => setIsLoading(false))
    }, [roomName])

    // Refetch on reconnect
    useEffect(() => {
        if (!shouldRefetch || !roomName) return;
        setShouldRefetch(false);
        const lastId = messages.filter(m => !m.pending).at(-1)?.id ?? null;
        axios.post(`${PROTOCOL}://${API_DOMAIN}/chat/read`,
            { room: roomName, last_seen_id: lastId },
            { withCredentials: true }
        ).then((res) => {
            const newMessages = res.data?.chats;
            if (Array.isArray(newMessages) && newMessages.length) {
                setMessages(prev => {
                    const existingIds = new Set(prev.filter(m => m.id).map(m => m.id));
                    const deduped = newMessages.filter(m => !existingIds.has(m.id));
                    return [...prev.filter(m => !m.pending), ...deduped];
                });
            }
        });
    }, [shouldRefetch, roomName]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (isLoading || didInitialScroll.current) return
        const el = containerRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
        didInitialScroll.current = true
    }, [isLoading, messages.length])

    // Follow bottom on new messages
    useEffect(() => {
        if (isLoading || isLoadingOlder || !isAtBottom.current) return
        const el = containerRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [messages, isLoading, isLoadingOlder])

    // Scroll handler
    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const onScroll = async () => {
            isAtBottom.current = el.scrollTop + el.clientHeight > el.scrollHeight - 50

            if (el.scrollTop < 50 && !isLoadingOlder && hasMoreMessages && messages.length) {
                setIsLoadingOlder(true)
                prevScrollHeight.current = el.scrollHeight
                try {
                    const res = await axios.post(
                        `${PROTOCOL}://${API_DOMAIN}/chat/read`,
                        { room: roomName, last_seen_id: -messages[0].id },
                        { withCredentials: true }
                    )
                    const older = res.data?.chats
                    if (Array.isArray(older) && older.length) {
                        setMessages((prev) => [...older, ...prev])
                        setHasMoreMessages(older.length === 100)
                    } else {
                        setHasMoreMessages(false)
                    }
                } finally {
                    setIsLoadingOlder(false)
                }
            }
        }

        el.addEventListener('scroll', onScroll)
        return () => el.removeEventListener('scroll', onScroll)
    }, [messages, isLoadingOlder, hasMoreMessages, roomName])

    // Preserve scroll position after prepend
    useEffect(() => {
        if (isLoadingOlder || !prevScrollHeight.current) return
        const el = containerRef.current
        if (el) {
            el.scrollTop += el.scrollHeight - prevScrollHeight.current
            prevScrollHeight.current = 0
        }
    }, [isLoadingOlder])

    // Incoming socket messages — replace pending if ulid matches
    useEffect(() => {
        if (!socket) return
        const onNew = (msg) => setMessages((prev) => {
            const idx = prev.findIndex(m => m.pending && m.ulid === msg.ulid);
            if (idx !== -1) {
                const next = [...prev];
                next[idx] = msg;
                return next;
            }
            return [...prev, msg];
        });
        socket.on('new', onNew)
        return () => socket.off('new', onNew)
    }, [socket])

    const handleSend = (e) => {
        e.preventDefault()
        if (!message.trim()) return

        const tempUlid = ulid();
        const optimistic = {
            ulid: tempUlid,
            username: user,
            content: message.trim(),
            pending: true,
            created_at: null,
        };

        setMessages(prev => [...prev, optimistic]);
        setMessage('');
        setError(null);

        socket.emit('send', { ulid: tempUlid, room: roomName, content: optimistic.content }, (ack) => {
            if (!ack.ok) {
                // remove optimistic message on failure
                setMessages(prev => prev.filter(m => m.ulid !== tempUlid));
                setError(ack.error);
            }
        });
    }

    const handleLeave = () => socket.emit('leaveRoom', { room: roomName }, () => navigate('/chat'))

    const formatTime = (ts) => {
        if (!ts) return null;
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="flex flex-col" style={{ height: '100dvh' }}>
            <Navbar />

            <div className="border-b border-base-300 px-4 py-1 text-sm font-medium flex items-center justify-between">
                <span># {roomName}</span>
                <button className="btn btn-sm btn-ghost text-error" onClick={handleLeave}>Leave</button>
            </div>

            <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                {isLoadingOlder && <div className="flex justify-center"><span className="loading loading-spinner loading-sm opacity-30" /></div>}
                {isLoading ? (
                    <div className="flex h-full items-center justify-center"><span className="loading loading-spinner opacity-30" /></div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm opacity-30 italic">No messages yet.</div>
                ) : messages.map((msg, i) => {
                    const mine = msg.username === user;
                    const time = formatTime(msg.created_at);
                    return (
                        <div key={msg.id ?? msg.ulid ?? i} className={`flex flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'} ${msg.pending ? 'opacity-50' : ''}`}>
                            <span className="text-xs opacity-40">{msg.username}</span>
                            <div className={`px-3 py-2 rounded text-sm max-w-sm break-words ${mine ? 'bg-neutral text-neutral-content' : 'bg-base-200'}`}>
                                {msg.content}
                            </div>
                            {time && <span className="text-xs opacity-30">{time}</span>}
                        </div>
                    )
                })}
            </div>

            <div className="border-t border-base-300 px-4 py-2 shrink-0">
                <div className="text-xs opacity-40 mb-1">{roomCount} in room</div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        className="input input-bordered flex-1 input-sm"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message..."
                    />
                    <button className="btn btn-neutral btn-sm" disabled={!message.trim()}>Send</button>
                </form>
                {error && <p className="text-error text-xs mt-1">{error}</p>}
            </div>
        </div>
    )
}