import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export default function RoomView({ roomName, user, socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    // Note: Ensure your backend emits "message" or similar to the room
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("message", handleMessage);
    return () => socket.off("message", handleMessage);
  }, [socket]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Matches backend chatManager.js: socket.on("send", ({ room, content }, ack))
    socket.emit("send", { room: roomName, content: message }, (ack) => {
      if (!ack.ok) {
        setError(ack.error);
      } else {
        setMessage("");
        setError(null);
      }
    });
  };

  const handleLeave = () => {
    // Matches backend roomManager.js: socket.on("leaveRoom", ({ room }, ack))
    socket.emit("leaveRoom", { room: roomName }, () => {
      navigate("/chat");
    });
  };

  return (
    <div className="card w-full max-w-2xl bg-base-100 shadow-xl border border-base-300">
      <div className="card-body p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-base-200/50 rounded-t-2xl">
          <div>
            <h2 className="card-title text-primary"># {roomName}</h2>
            <p className="text-xs opacity-70">
              {user ? `Logged in as ${user.username}` : "Authenticating..."}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm text-error" onClick={handleLeave}>
            Leave Room
          </button>
        </div>

        {/* Chat Area */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-base-100/30">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center opacity-30 italic">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`chat ${msg.username === user?.username ? "chat-end" : "chat-start"}`}>
                <div className="chat-header opacity-50 text-xs mb-1">
                  {msg.username}
                </div>
                <div className={`chat-bubble ${msg.username === user?.username ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* Footer / Input */}
        <div className="p-4 border-t border-base-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className={`input input-bordered flex-1 focus:input-primary transition-all ${error ? "input-error" : ""}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={!message.trim()}>
              Send
            </button>
          </form>
          {error && <p className="text-error text-xs mt-2 px-1">⚠️ {error}</p>}
        </div>
      </div>
    </div>
  );
}