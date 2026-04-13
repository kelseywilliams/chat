import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { PROTOCOL, API_DOMAIN } from '../config/index.js'
import Navbar from './NavBar.jsx'
import { useSessionStore } from '../store/useSessionStore.js'

export default function RoomView({ roomName, user, socket }) {
    const roomCount = useSessionStore((state) => state.roomCount);
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

    // Scroll handler — track bottom, load older at top
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

    // Incoming socket messages
    useEffect(() => {
        if (!socket) return
        const onNew = (msg) => setMessages((prev) => [...prev, msg])
        socket.on('new', onNew)
        return () => socket.off('new', onNew)
    }, [socket])

    const handleSend = (e) => {
        e.preventDefault()
        if (!message.trim()) return
        socket.emit('send', { room: roomName, content: message }, (ack) => {
            if (!ack.ok) setError(ack.error)
            else { setMessage(''); setError(null) }
        })
    }

    const handleLeave = () => socket.emit('leaveRoom', { room: roomName }, () => navigate('/chat'))

    return (
        <div className="h-screen flex flex-col bg-base-100">
            <Navbar />

            <div className="border-b border-base-300 px-6 py-1 text-sm font-medium flex items-center justify-between">
                <span># {roomName}</span>
                <button className="btn btn-sm btn-ghost text-error" onClick={handleLeave}>Leave</button>
            </div>

            <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3" style={{ height: 'calc(100vh - 180px)' }}>
                {isLoadingOlder && <div className="flex justify-center"><span className="loading loading-spinner loading-sm opacity-30" /></div>}

                {isLoading ? (
                    <div className="flex h-full items-center justify-center"><span className="loading loading-spinner opacity-30" /></div>
                ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm opacity-30 italic">No messages yet.</div>
                ) : messages.map((msg) => {
                    const mine = msg.username === user
                    return (
                        <div key={msg.id} className={`flex flex-col gap-0.5 ${mine ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs opacity-40">{msg.username}</span>
                            <div className={`px-3 py-2 rounded text-sm max-w-sm break-words ${mine ? 'bg-neutral text-neutral-content' : 'bg-base-200'}`}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="border-t border-base-300 px-6 py-3">
                <div className="text-xs opacity-40 mb-2">{roomCount} in room</div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        className="input input-bordered flex-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message..."
                    />
                    <button className="btn btn-neutral" disabled={!message.trim()}>Send</button>
                </form>
                {error && <p className="text-error text-xs mt-2">{error}</p>}
            </div>
        </div>
    )
}
