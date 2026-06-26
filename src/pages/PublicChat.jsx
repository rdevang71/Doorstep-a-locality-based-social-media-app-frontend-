import { Edit3, Eye, Image, Lock, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";

const emptyRoom = {
  name: "",
  description: "",
  avatar: "",
  avatarFile: null,
  type: "public",
  password: "",
};

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);

export default function PublicChat() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [joiningRoom, setJoiningRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [joinForm, setJoinForm] = useState({ roomCode: "", password: "" });
  const [busy, setBusy] = useState(false);

  const selectedDescription = useMemo(() => {
    if (!room) return "Choose a room to join the conversation.";
    return room.description || `${room.type === "private" ? "Private" : "Public"} local chat room`;
  }, [room]);

  const loadRooms = () =>
    api
      .get("/chat/rooms")
      .then((r) => {
        const data = r.data || [];
        setRooms(data);
        setRoom((current) => {
          if (current && data.some((item) => item._id === current._id)) {
            return data.find((item) => item._id === current._id);
          }
          return data.find((item) => item.type === "public") || data[0];
        });
      })
      .catch(() => {
        setRooms([]);
        setRoom(undefined);
      });

  useEffect(() => {
    loadRooms();
  }, []);

  const openCreate = () => {
    setForm(emptyRoom);
    setCreating(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || "",
      description: item.description || "",
      avatar: item.avatar || "",
      avatarFile: null,
      type: item.type || "public",
      password: "",
    });
    setEditing(item);
  };

  const createRoom = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("description", form.description);
      body.append("type", form.type);
      body.append("password", form.password);
      if (user?.city) body.append("city", user.city);
      if (user?.locality) body.append("locality", user.locality);
      if (form.avatarFile) body.append("avatar", form.avatarFile);
      const { data } = await api.post("/chat/rooms", body);
      setCreating(false);
      setForm(emptyRoom);
      await loadRooms();
      setRoom(data);
      toast.success("Chat room created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create room");
    } finally {
      setBusy(false);
    }
  };

  const updateRoom = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("description", form.description);
      body.append("type", form.type);
      if (form.password) body.append("password", form.password);
      if (form.avatarFile) body.append("avatar", form.avatarFile);
      const { data } = await api.put(`/chat/rooms/${editing._id}`, body);
      setEditing(null);
      setForm(emptyRoom);
      await loadRooms();
      setRoom(data);
      toast.success("Room updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update room");
    } finally {
      setBusy(false);
    }
  };

  const openRoom = (item) => {
    if (item.type !== "private" || item.members?.some((id) => sameId(id, user?.id || user?._id))) {
      setRoom(item);
      return;
    }
    setJoiningRoom(item);
    setJoinForm({ roomCode: item.roomCode || "", password: "" });
  };

  const joinPrivateRoom = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/chat/rooms/join", joinForm);
      setJoiningRoom(null);
      setJoinForm({ roomCode: "", password: "" });
      await loadRooms();
      setRoom(data);
      toast.success("Joined private room");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join room");
    } finally {
      setBusy(false);
    }
  };

  const ownerId = user?.id || user?._id;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold text-coral">CHAT ROOMS</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Talk to the neighbourhood</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setJoiningRoom({})} className="btn-soft">
            <Search size={18} /> Join private
          </button>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={18} /> Create room
          </button>
        </div>
      </div>

      <div className="card mt-8 grid overflow-hidden lg:grid-cols-[340px_1fr]">
        <aside className="max-h-[38rem] overflow-y-auto border-r border-forest/10 p-3">
          {rooms.map((item) => {
            const isOwner = sameId(item.createdBy, ownerId);
            const isSelected = room?._id === item._id;
            return (
              <div key={item._id} className={`mb-2 rounded-2xl p-2 ${isSelected ? "bg-mint" : "hover:bg-cream"}`}>
                <button onClick={() => openRoom(item)} className="flex w-full gap-3 rounded-xl p-2 text-left">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-forest text-lg font-bold text-lime">
                    {item.avatar ? <img src={item.avatar} alt="" className="h-full w-full object-cover" /> : item.name?.[0] || "#"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold">{item.name}</p>
                      {item.type === "private" ? <Lock size={14} className="text-coral" /> : <Eye size={14} className="text-forest/50" />}
                    </div>
                    <p className="truncate text-xs text-ink/45">{item.description || item.locality || item.city}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink/40">
                      ID {item.roomCode || "legacy"} - {item.type}
                    </p>
                  </div>
                </button>
                {isOwner && (
                  <button onClick={() => openEdit(item)} className="ml-2 mt-1 inline-flex items-center gap-1 text-xs font-bold text-coral">
                    <Edit3 size={13} /> Edit room
                  </button>
                )}
              </div>
            );
          })}
          {!rooms.length && <p className="p-3 text-sm text-ink/45">No chat rooms yet.</p>}
        </aside>
        <ChatBox room={room} description={selectedDescription} />
      </div>

      {(creating || editing) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <form onSubmit={editing ? updateRoom : createRoom} className="card relative w-full max-w-lg space-y-4 p-7">
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
              className="absolute right-5 top-5 rounded-full p-1 hover:bg-mint"
              aria-label="Close room form"
            >
              <X />
            </button>
            <h2 className="text-2xl">{editing ? "Edit chat room" : "Create chat room"}</h2>
            <label className="label">
              Room name
              <input className="field mt-1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="label">
              Description
              <textarea className="field mt-1 min-h-24 resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="label">
              Room pfp image
              <div className="mt-2 flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-forest text-xl font-bold text-lime">
                  {form.avatarFile ? (
                    <img src={URL.createObjectURL(form.avatarFile)} alt="Room preview" className="h-full w-full object-cover" />
                  ) : form.avatar ? (
                    <img src={form.avatar} alt="Room preview" className="h-full w-full object-cover" />
                  ) : (
                    form.name?.[0] || <Image size={22} />
                  )}
                </div>
                <input
                  className="field file:mr-3 file:border-0 file:bg-transparent file:font-semibold"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => setForm({ ...form, avatarFile: e.target.files?.[0] || null })}
                />
              </div>
            </label>
            <label className="label">
              Room type
              <select className="field mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            {form.type === "private" && (
              <label className="label">
                {editing ? "New password (leave blank to keep current)" : "Password"}
                <input className="field mt-1" type="password" required={!editing} minLength={4} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
            )}
            <button disabled={busy} className="btn-primary w-full">
              {busy ? "Saving..." : editing ? "Save room" : "Create room"}
            </button>
          </form>
        </div>
      )}

      {joiningRoom && !creating && !editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <form onSubmit={joinPrivateRoom} className="card relative w-full max-w-md space-y-4 p-7">
            <button
              type="button"
              onClick={() => setJoiningRoom(null)}
              className="absolute right-5 top-5 rounded-full p-1 hover:bg-mint"
              aria-label="Close join form"
            >
              <X />
            </button>
            <h2 className="text-2xl">Join private room</h2>
            <label className="label">
              Room ID
              <input className="field mt-1 uppercase" required value={joinForm.roomCode} onChange={(e) => setJoinForm({ ...joinForm, roomCode: e.target.value.toUpperCase() })} />
            </label>
            <label className="label">
              Password
              <input className="field mt-1" type="password" required value={joinForm.password} onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })} />
            </label>
            <button disabled={busy} className="btn-primary w-full">
              <Lock size={17} /> {busy ? "Joining..." : "Join room"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}


