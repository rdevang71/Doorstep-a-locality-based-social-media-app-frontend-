import { Check, ExternalLink, Heart, MessageCircle, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";

const typeMeta = {
  friend_request: { label: "Friend request", Icon: UserPlus },
  friend_accept: { label: "Friend update", Icon: UserPlus },
  post_like: { label: "Post like", Icon: Heart },
  post_comment: { label: "Post comment", Icon: MessageCircle },
  community_join_request: { label: "Community request", Icon: Users },
  community_join_approved: { label: "Community update", Icon: Users },
  community_join_rejected: { label: "Community update", Icon: Users },
};

const communityIdFrom = (item) =>
  item.data?.communityId || item.link?.match(/\/communities\/([^/?#]+)/)?.[1];

const notifyNotificationsChanged = () =>
  window.dispatchEvent(new Event("localconnect:notifications-changed"));

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState("");

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);
  const load = () => api.get("/notifications").then((r) => setItems(r.data || []));

  useEffect(() => {
    load().catch(() => toast.error("Could not load notifications"));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setItems((current) => current.map((item) => (item._id === id ? { ...item, read: true } : item)));
    notifyNotificationsChanged();
  };

  const decideFriend = async (item, action) => {
    const actorId = item.actor?._id;
    if (!actorId) return toast.error("Could not find this friend request");

    setBusy(`friend:${action}:${actorId}`);
    try {
      await api.put(`/users/${actorId}/friend-${action}`);
      await api.put(`/notifications/${item._id}/read`).catch(() => {});
      await load();
      notifyNotificationsChanged();
      toast.success(action === "accept" ? "Friend request accepted" : "Friend request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update friend request");
    } finally {
      setBusy("");
    }
  };

  const decideCommunity = async (item, action) => {
    const communityId = communityIdFrom(item);
    const actorId = item.actor?._id;
    if (!communityId || !actorId) return toast.error("Could not find this community request");

    setBusy(`community:${action}:${item._id}`);
    try {
      await api.put(`/communities/${communityId}/requests/${actorId}/${action}`);
      await api.put(`/notifications/${item._id}/read`).catch(() => {});
      await load();
      notifyNotificationsChanged();
      toast.success(action === "approve" ? "Join request approved" : "Join request rejected");
    } catch (error) {
      if (error.response?.status === 404) {
        await api.put(`/notifications/${item._id}/read`).catch(() => {});
        await load();
        notifyNotificationsChanged();
        toast.error("This join request was already handled");
      } else {
        toast.error(error.response?.data?.message || "Could not update community request");
      }
    } finally {
      setBusy("");
    }
  };

  const markAll = async () => {
    try {
      await api.put("/notifications/read-all");
      await load();
      notifyNotificationsChanged();
    } catch {
      toast.error("Could not mark notifications as read");
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-bold text-coral">NOTIFICATIONS</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Requests and updates</h1>
          <p className="mt-2 text-ink/55 dark:text-white/55">
            {unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You are all caught up"}
          </p>
        </div>
        <button onClick={markAll} className="btn-soft">Mark all read</button>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => {
          const meta = typeMeta[item.type] || { label: "Update", Icon: ExternalLink };
          const Icon = meta.Icon;
          const disabled = Boolean(busy);

          return (
            <article key={item._id} className={`card p-5 ${item.read ? "opacity-70" : ""}`}>
              <div className="flex gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-forest font-bold text-lime">
                  {item.actor?.avatar ? <img src={item.actor.avatar} alt="" className="h-full w-full object-cover" /> : item.actor?.name?.[0] || "L"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-xs font-bold text-forest">
                      <Icon size={14} />
                      {meta.label}
                    </span>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-coral" aria-label="Unread" />}
                  </div>
                  <p className="mt-3 font-semibold">{item.message}</p>
                  <p className="mt-1 text-xs text-ink/45">{new Date(item.createdAt).toLocaleString()}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.link && (
                      <Link to={item.link} onClick={() => markRead(item._id)} className="btn-soft">
                        <ExternalLink size={16} />
                        Open
                      </Link>
                    )}
                    {!item.read && item.type === "friend_request" && item.actor?._id && (
                      <>
                        <button disabled={disabled} onClick={() => decideFriend(item, "accept")} className="btn-primary"><Check size={16} /> Accept</button>
                        <button disabled={disabled} onClick={() => decideFriend(item, "reject")} className="btn-soft text-coral"><X size={16} /> Reject</button>
                      </>
                    )}
                    {!item.read && item.type === "community_join_request" && item.actor?._id && (
                      <>
                        <button disabled={disabled} onClick={() => decideCommunity(item, "approve")} className="btn-primary"><Check size={16} /> Approve</button>
                        <button disabled={disabled} onClick={() => decideCommunity(item, "reject")} className="btn-soft text-coral"><X size={16} /> Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!items.length && <div className="card p-10 text-center text-ink/50">No notifications yet.</div>}
      </div>
    </main>
  );
}
