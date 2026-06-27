import { Edit3, Eye, Image, Lock, Plus, Search, Trash2, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
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
  const isSuperAdmin = user?.role === "super_admin";
  const [mode, setMode] = useState("rooms");
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [room, setRoom] = useState();
  const [activeFriend, setActiveFriend] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [joiningRoom, setJoiningRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);
  const [joinForm, setJoinForm] = useState({ roomCode: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [privateRoomPasswords, setPrivateRoomPasswords] = useState({});
  const [roomSearch, setRoomSearch] = useState("");

  const filteredRooms = useMemo(() => {
    const query = roomSearch.trim().toLowerCase();
    if (!query) return rooms;
    return rooms.filter((item) =>
      [
        item.name,
        item.description,
        item.roomCode,
        item.type,
        item.city,
        item.locality,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [rooms, roomSearch]);

  const getStoredRoomPassword = (item) =>
    privateRoomPasswords[item?._id] || privateRoomPasswords[item?.roomCode] || "";

  const rememberRoomPassword = (item, password) => {
    if (!item || !password) return;
    setPrivateRoomPasswords((current) => ({
      ...current,
      ...(item._id && { [item._id]: password }),
      ...(item.roomCode && { [item.roomCode]: password }),
    }));
  };

  const forgetRoomPassword = (item) => {
    setPrivateRoomPasswords((current) => {
      const next = { ...current };
      if (item?._id) delete next[item._id];
      if (item?.roomCode) delete next[item.roomCode];
      return next;
    });
  };

  const selectedDescription = useMemo(() => {
    if (!room) return mode === "friends" ? "Choose a friend to start chatting." : "Choose a room to join the conversation.";
    if (mode === "friends") return activeFriend ? `${isSuperAdmin ? "Direct chat" : "Private chat"} with ${activeFriend.name}` : isSuperAdmin ? "All direct chats" : "Friends-only direct chat";
    return room.description || `${room.type === "private" ? "Private" : "Public"} local chat room`;
  }, [activeFriend, isSuperAdmin, mode, room]);

  const loadRooms = () =>
    api
      .get("/chat/rooms")
      .then((r) => {
        const data = r.data || [];
        setRooms(data);
        if (mode !== "rooms") return;
        setRoom((current) => {
          if (current && data.some((item) => item._id === current._id)) {
            return data.find((item) => item._id === current._id);
          }
          return data.find((item) => item.type === "public") || data[0];
        });
      })
      .catch(() => {
        setRooms([]);
        if (mode === "rooms") setRoom(undefined);
      });

  const loadFriends = () =>
    api
      .get("/chat/friends")
      .then((r) => setFriends(r.data || []))
      .catch(() => setFriends([]));

  useEffect(() => {
    loadRooms();
    loadFriends();
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setRoomPassword("");
    setActiveFriend(null);
    if (next === "rooms") {
      setRoom(rooms.find((item) => item.type === "public") || rooms[0]);
    } else {
      setRoom(undefined);
      loadFriends();
    }
  };

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
      const createdPassword = form.password;
      if (data.type === "private" && createdPassword) rememberRoomPassword(data, createdPassword);
      setRoomPassword(data.type === "private" ? createdPassword : "");
      setCreating(false);
      setForm(emptyRoom);
      await loadRooms();
      setMode("rooms");
      setActiveFriend(null);
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
      const updatedPassword = form.password;
      if (data.type === "private" && updatedPassword) {
        rememberRoomPassword(data, updatedPassword);
        if (room?._id === data._id) setRoomPassword(updatedPassword);
      } else if (data.type !== "private") {
        forgetRoomPassword(data);
        if (room?._id === data._id) setRoomPassword("");
      }
      setEditing(null);
      setForm(emptyRoom);
      await loadRooms();
      setMode("rooms");
      setActiveFriend(null);
      setRoom(data);
      toast.success("Room updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update room");
    } finally {
      setBusy(false);
    }
  };

  const openRoom = (item) => {
    setMode("rooms");
    setActiveFriend(null);
    if (item.type !== "private" || isSuperAdmin) {
      setRoomPassword("");
      setRoom(item);
      return;
    }
    const savedPassword = getStoredRoomPassword(item);
    if (savedPassword) {
      setRoomPassword(savedPassword);
      setRoom(item);
      return;
    }
    setJoiningRoom(item);
    setJoinForm({ roomCode: item.roomCode || "", password: "" });
  };

  const openFriend = async (entry) => {
    const friend = entry.friend;
    if (isSuperAdmin && entry.room) {
      setMode("friends");
      setRoomPassword("");
      setActiveFriend(friend);
      setRoom({
        ...entry.room,
        name: friend?.name || entry.room.name,
        avatar: friend?.avatar || entry.room.avatar,
        description: entry.room.description || "Super admin direct chat view",
      });
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post(`/chat/direct/${friend._id}`);
      setMode("friends");
      setRoomPassword("");
      setActiveFriend(data.friend || friend);
      setRoom({
        ...data.room,
        name: data.friend?.name || friend.name,
        avatar: data.friend?.avatar || friend.avatar,
        description: "Friends-only direct chat",
      });
      await loadFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not open friend chat");
    } finally {
      setBusy(false);
    }
  };

  const joinPrivateRoom = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/chat/rooms/join", joinForm);
      setJoiningRoom(null);
      const password = joinForm.password;
      rememberRoomPassword(data, password);
      setJoinForm({ roomCode: "", password: "" });
      await loadRooms();
      setMode("rooms");
      setActiveFriend(null);
      setRoomPassword(password);
      setRoom(data);
      toast.success("Joined private room");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join room");
    } finally {
      setBusy(false);
    }
  };

  const deleteRoom = async (item) => {
    if (!window.confirm(`Delete ${item.name}? This removes the room and its messages.`)) return;
    setBusy(true);
    try {
      await api.delete(`/chat/rooms/${item._id}`);
      forgetRoomPassword(item);
      if (room?._id === item._id) {
        setRoom(undefined);
        setRoomPassword("");
      }
      await loadRooms();
      toast.success("Room deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete room");
    } finally {
      setBusy(false);
    }
  };

  const ownerId = user?.id || user?._id;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold text-coral">CHAT</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Talk to the neighbourhood</h1>
        </div>
        {mode === "rooms" && (
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setJoiningRoom({})} className="btn-soft">
              <Search size={18} /> Join private
            </button>
            <button onClick={openCreate} className="btn-primary">
              <Plus size={18} /> Create room
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 inline-flex rounded-full bg-mint p-1">
        <button onClick={() => switchMode("rooms")} className={`rounded-full px-5 py-2 font-bold transition ${mode === "rooms" ? "bg-forest text-white" : "text-forest/70 hover:text-forest"}`}>Chat rooms</button>
        <button onClick={() => switchMode("friends")} className={`rounded-full px-5 py-2 font-bold transition ${mode === "friends" ? "bg-forest text-white" : "text-forest/70 hover:text-forest"}`}>{isSuperAdmin ? "Direct chats" : "Chat with friends"}</button>
      </div>

      <div className="card mt-6 grid overflow-hidden lg:grid-cols-[340px_1fr]">
        <aside className="max-h-[38rem] overflow-y-auto border-r border-forest/10 p-3">
          {mode === "rooms" ? (
            <>
              <label className="relative mb-3 block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest/45" />
                <input
                  className="field h-11 pl-9 text-sm"
                  placeholder="Search public or private rooms"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                />
              </label>
              {filteredRooms.map((item) => {
                const isOwner = item.canEdit || sameId(item.ownerId, ownerId) || sameId(item.createdBy, ownerId);
                const isSelected = room?._id === item._id && !activeFriend;
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
                      <div className="ml-2 mt-1 flex flex-wrap gap-3">
                        <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 text-xs font-bold text-coral">
                          <Edit3 size={13} /> Edit room
                        </button>
                        <button disabled={busy} onClick={() => deleteRoom(item)} className="inline-flex items-center gap-1 text-xs font-bold text-coral">
                          <Trash2 size={13} /> Delete room
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {!rooms.length && <p className="p-3 text-sm text-ink/45">No chat rooms yet.</p>}
              {Boolean(rooms.length && !filteredRooms.length) && <p className="p-3 text-sm text-ink/45">No rooms match your search.</p>}
            </>
          ) : (
            <>
              {friends.map((entry) => {
                const friend = entry.friend;
                const isSelected = activeFriend && sameId(activeFriend._id, friend._id);
                return (
                  <div key={friend._id} className={`mb-2 rounded-2xl p-2 ${isSelected ? "bg-mint" : "hover:bg-cream"}`}>
                    <button onClick={() => openFriend(entry)} className="flex w-full gap-3 rounded-xl p-2 text-left">
                      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-forest text-lg font-bold text-lime">
                        {friend.avatar ? <img src={friend.avatar} alt="" className="h-full w-full object-cover" /> : friend.name?.[0] || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{friend.name}</p>
                        <p className="truncate text-xs text-ink/45">{[friend.locality, friend.city].filter(Boolean).join(", ") || "Friend"}</p>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink/40">{isSuperAdmin ? "Direct chat" : "Private friend chat"}</p>
                      </div>
                    </button>
                  </div>
                );
              })}
              {!friends.length && (
                <div className="grid gap-3 p-3 text-sm text-ink/55">
                  <Users size={24} className="text-coral" />
                  <p>{isSuperAdmin ? "No direct chats yet." : "No friends yet. Add friends from profiles, then chat with them here."}</p>
                  <Link to="/profile" className="font-bold text-coral">View your profile</Link>
                </div>
              )}
            </>
          )}
        </aside>
        <ChatBox room={room} password={roomPassword} description={selectedDescription} />
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
            <h2 className="text-2xl">{joiningRoom?._id ? "Enter private room password" : "Join private room"}</h2>
            <label className="label">
              Room ID
              <input className="field mt-1 uppercase" required value={joinForm.roomCode} onChange={(e) => setJoinForm({ ...joinForm, roomCode: e.target.value.toUpperCase() })} />
            </label>
            <label className="label">
              Password
              <input className="field mt-1" type="password" required={!isSuperAdmin} value={joinForm.password} onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })} />
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
