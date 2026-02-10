import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function RoomView({ roomName, user, socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const previousScrollHeight = useRef(0);
  const isAtBottomRef = useRef(true);
  const didInitialScrollRef = useRef(false); // NEW

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.post(
          `/api/chat/read`,
          { room: roomName, last_seen_id: null },
          { withCredentials: true }
        );

        const chats = response.data?.chats;
        if (Array.isArray(chats)) {
          setMessages(chats);
          setHasMoreMessages(chats.length === 100);
        } else {
          setMessages([]);
          setError("Unexpected response format");
        }
      } catch (err) {
        setMessages([]);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomName) loadMessages();
  }, [roomName]);

  // Scroll to bottom once after initial load finishes (guaranteed)
  useEffect(() => {
    if (isLoading) return;
    if (didInitialScrollRef.current) return;

    const el = chatContainerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
    didInitialScrollRef.current = true;
  }, [isLoading, messages.length]);

  // Auto-follow newest messages (BOTTOM) when user is already near bottom
  useEffect(() => {
    if (isLoading) return;

    const el = chatContainerRef.current;
    if (!el) return;

    if (!isLoadingOlder && isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight; // no smooth; deterministic
    }
  }, [messages, isLoadingOlder, isLoading]);

  // Scroll handler (load older when near TOP)
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    const onScroll = async () => {
      const nearTop = el.scrollTop < 50;
      const nearBottom =
        el.scrollTop + el.clientHeight > el.scrollHeight - 50;

      isAtBottomRef.current = nearBottom;

      if (nearTop && !isLoadingOlder && hasMoreMessages && messages.length) {
        setIsLoadingOlder(true);
        previousScrollHeight.current = el.scrollHeight;

        try {
          const oldestId = messages[0].id;

          const response = await axios.post(
            `/api/chat/read`,
            { room: roomName, last_seen_id: -oldestId },
            { withCredentials: true }
          );

          const older = response.data?.chats;
          if (Array.isArray(older) && older.length) {
            setMessages((prev) => [...older, ...prev]);
            setHasMoreMessages(older.length === 100);
          } else {
            setHasMoreMessages(false);
          }
        } finally {
          setIsLoadingOlder(false);
        }
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [messages, isLoadingOlder, hasMoreMessages, roomName]);

  // Preserve scroll position when older messages prepend
  useEffect(() => {
    if (!isLoadingOlder && previousScrollHeight.current) {
      const el = chatContainerRef.current;
      if (el) {
        const delta = el.scrollHeight - previousScrollHeight.current;
        el.scrollTop += delta;
        previousScrollHeight.current = 0;
      }
    }
  }, [isLoadingOlder]);

  // Incoming socket messages → newest at bottom (append)
  useEffect(() => {
    if (!socket) return;

    const onNew = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("new", onNew);
    return () => socket.off("new", onNew);
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit("send", { room: roomName, content: message }, (ack) => {
      if (!ack.ok) setError(ack.error);
      else {
        setMessage("");
        setError(null);
      }
    });
  };

  const handleLeave = () => {
    socket.emit("leaveRoom", { room: roomName }, () => navigate("/chat"));
  };

  return (
    <div className="card w-full max-w-2xl bg-base-100 shadow-xl border border-base-300">
      <div className="card-body p-0">
        <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-t-2xl">
          <div>
            <h2 className="card-title text-primary"># {roomName}</h2>
            <p className="text-xs opacity-70">
              {user ? `Logged in as ${user}` : "Authenticating..."}
            </p>
          </div>
          <button
            className="btn btn-ghost btn-sm text-error"
            onClick={handleLeave}
          >
            Leave Room
          </button>
        </div>

        <div
          ref={chatContainerRef}
          className="h-[400px] overflow-y-auto p-4 space-y-4 bg-base-100/30"
        >
          {isLoadingOlder && (
            <div className="flex justify-center py-2">
              <span className="loading loading-spinner loading-sm" />
            </div>
          )}

          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center opacity-30 italic">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat ${
                  msg.username === user ? "chat-end" : "chat-start"
                }`}
              >
                <div className="chat-header opacity-50 text-xs mb-1">
                  {msg.username}
                </div>
                <div
                  className={`chat-bubble ${
                    msg.username === user
                      ? "chat-bubble-primary"
                      : "chat-bubble-secondary"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-base-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              className={`input input-bordered flex-1 ${
                error ? "input-error" : ""
              }`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button className="btn btn-primary" disabled={!message.trim()}>
              Send
            </button>
          </form>
          {error && <p className="text-error text-xs mt-2">⚠️ {error}</p>}
        </div>
      </div>
    </div>
  );
}
