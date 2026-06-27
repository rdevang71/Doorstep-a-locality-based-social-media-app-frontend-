import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState("");

  const load = () => api.get("/notifications").then((r) => setItems(r.data || []));
  useEffect(() => {
    load().catch(() => toast.error("Could not load notifications"));
  }, []);

  const decideFriend = async (actorId, action) => {
    setBusy(`${action}:${actorId}`);
    try {
      await api.put(`/users/${actorId}/friend-${action}`);
      await load();
      toast.success(action === "accept" ? "Friend request accepted" : "Friend request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update friend request");
    } finally {
      setBusy("");
    }
  };

  const markAll = async () => {
    await api.put("/notifications/read-all");
    await load();
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-bold text-coral">NOTIFICATIONS</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Requests and updates</h1>
        </div>
        <button onClick={markAll} className="btn-soft">Mark all read</button>
      </div>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <article key={item._id} className={`card p-5 ${item.read ? "opacity-70" : ""}`}>
            <div className="flex gap-4">
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-forest font-bold text-lime">
                {item.actor?.avatar ? <img src={item.actor.avatar} alt="" className="h-full w-full object-cover" /> : item.actor?.name?.[0] || "L"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.message}</p>
                <p className="mt-1 text-xs text-ink/45">{new Date(item.createdAt).toLocaleString()}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.link && <Link to={item.link} className="btn-soft">Open</Link>}
                  {item.type === "friend_request" && item.actor?._id && (
                    <>
                      <button disabled={Boolean(busy)} onClick={() => decideFriend(item.actor._id, "accept")} className="btn-primary"><Check size={16} /> Accept</button>
                      <button disabled={Boolean(busy)} onClick={() => decideFriend(item.actor._id, "reject")} className="btn-soft text-coral"><X size={16} /> Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
        {!items.length && <div className="card p-10 text-center text-ink/50">No notifications yet.</div>}
      </div>
    </main>
  );
}
