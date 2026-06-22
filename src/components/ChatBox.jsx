import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/axiosInstance";
export default function ChatBox({ room }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socket = useRef();
  useEffect(() => {
    if (!room) return;
    api
      .get(`/chat/rooms/${room._id}/messages`)
      .then((r) => setMessages(r.data));
    socket.current = io(
      (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(
        /\/api\/?$/,
        "",
      ),
      { auth: { token: localStorage.getItem("lc_token") } },
    );
    socket.current.emit("room:join", room._id);
    socket.current.on("message:new", (m) => setMessages((v) => [...v, m]));
    return () => socket.current?.disconnect();
  }, [room]);
  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.current.emit(
      "message:send",
      { roomId: room._id, content: text },
      (r) => {
        if (r.ok) setText("");
      },
    );
  };
  if (!room)
    return (
      <div className="grid h-96 place-items-center text-ink/45">
        Choose a room to join the conversation.
      </div>
    );
  return (
    <div className="flex h-[32rem] flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl">{room.name}</h2>
        <p className="text-xs text-ink/45">
          Public room · Be kind, keep it local
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m._id} className="max-w-[80%] rounded-2xl bg-mint p-3">
            <b className="text-xs">{m.sender?.name}</b>
            <p>{m.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-4">
        <input
          className="field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
        />
        <button className="btn-primary">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
