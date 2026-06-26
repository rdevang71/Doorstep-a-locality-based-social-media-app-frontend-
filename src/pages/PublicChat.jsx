import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";
export default function PublicChat() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState();
  useEffect(() => {
    api
      .get("/chat/rooms", { params: { city: user?.city } })
      .then((r) => {
        setRooms(r.data || []);
        setRoom(r.data?.[0]);
      })
      .catch(() => {
        setRooms([]);
        setRoom(undefined);
      });
  }, [user?.city]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-bold text-coral">PUBLIC CHAT ROOMS</p>
      <h1 className="mt-2 text-4xl">Talk to the neighbourhood</h1>
      <div className="card mt-8 grid overflow-hidden md:grid-cols-[260px_1fr]">
        <aside className="border-r border-forest/10 p-3">
          {rooms.map((r) => (
            <button
              onClick={() => setRoom(r)}
              key={r._id}
              className={`mb-1 w-full rounded-xl p-3 text-left font-semibold ${room?._id === r._id ? "bg-mint" : "hover:bg-cream"}`}
            >
              {r.name}
              <small className="block font-normal text-ink/45">
                {r.locality || r.city}
              </small>
            </button>
          ))}
          {!rooms.length && (
            <p className="p-3 text-sm text-ink/45">No public rooms yet.</p>
          )}
        </aside>
        <ChatBox room={room} />
      </div>
    </main>
  );
}

