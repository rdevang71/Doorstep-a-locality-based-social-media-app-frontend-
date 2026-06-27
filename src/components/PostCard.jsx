import {
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Save,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, onUpdated, onDeleted }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState(post);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(
    post.likes?.some(
      (id) => String(id?._id || id) === String(user?.id || user?._id),
    ),
  );
  const [editForm, setEditForm] = useState({
    content: post.content || "",
    type: post.type || "general",
    hashtags: post.hashtags?.join(" ") || "",
  });

  useEffect(() => {
    setCurrent(post);
    setLikes(post.likes?.length || 0);
    setLiked(
      post.likes?.some(
        (id) => String(id?._id || id) === String(user?.id || user?._id),
      ) || false,
    );
  }, [post, user?.id, user?._id]);

  const ownerId = current.author?._id || current.author;
  const userId = user?.id || user?._id;
  const isOwner = Boolean(userId && ownerId && String(ownerId) === String(userId));
  const business = current.businessPage;

  const like = async () => {
    if (!user) return toast.error("Sign in to like posts");
    try {
      const { data } = await api.put("/posts/" + current._id + "/like");
      setLiked(data.liked);
      setLikes(data.likesCount);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not like post");
    }
  };

  const beginEdit = () => {
    setEditForm({
      content: current.content || "",
      type: current.type || "general",
      hashtags: current.hashtags?.join(" ") || "",
    });
    setMenuOpen(false);
    setEditing(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/posts/" + current._id, {
        content: editForm.content.trim(),
        type: editForm.type,
        hashtags: editForm.hashtags,
      });
      setCurrent(data);
      setEditing(false);
      onUpdated?.(data);
      toast.success("Post updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update post");
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async () => {
    setMenuOpen(false);
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await api.delete("/posts/" + current._id);
      setVisible(false);
      onDeleted?.(current._id);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete post");
    }
  };

  if (!visible) return null;

  return (
    <article className="card overflow-visible p-5 sm:p-6">
      <div className="mb-4 flex items-center">
        <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-forest text-lg font-bold text-lime">
          {current.author?.avatar ? (
            <img src={current.author.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            current.author?.name?.[0] || "L"
          )}
        </div>
        <div className="ml-3">
          <Link to={current.author?._id ? `/profile/${current.author._id}` : "#"} className="font-bold hover:text-coral">{current.author?.name || "Neighbour"}</Link>
          <p className="flex items-center gap-1 text-xs text-ink/50">
            <MapPin size={12} />
            {current.locality}, {current.city} ·{" "}
            {new Date(current.createdAt).toLocaleDateString()}
          </p>
        </div>

        {isOwner && (
          <div className="relative ml-auto">
            <button
              type="button"
              aria-label="Post options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="rounded-full p-2 text-ink/40 hover:bg-mint"
            >
              <MoreHorizontal />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 z-20 min-w-32 overflow-hidden rounded-xl border border-forest/10 bg-white p-1 shadow-soft">
                <button
                  type="button"
                  onClick={beginEdit}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-mint"
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  type="button"
                  onClick={deletePost}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-coral hover:bg-cream"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {business && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-mint px-4 py-3 text-sm">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-forest">
            <Store size={17} />
          </span>
          <div>
            <p className="font-bold">{business.name}</p>
            <p className="text-xs text-ink/50">
              {business.category || "Local business"}
            </p>
          </div>
        </div>
      )}

      <Link to={"/posts/" + current._id}>
        <p className="whitespace-pre-wrap text-[1.05rem] leading-7">
          {current.content}
        </p>
        {current.images?.[0] && (
          <img
            className="mt-4 max-h-96 w-full rounded-2xl object-cover"
            src={current.images[0]}
            alt="Post"
          />
        )}
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {current.hashtags?.map((tag) => (
          <Link
            to={"/?hashtag=" + tag}
            key={tag}
            className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest"
          >
            #{tag}
          </Link>
        ))}
      </div>

      <div className="mt-5 flex gap-5 border-t border-forest/10 pt-4">
        <button
          type="button"
          onClick={like}
          className={
            "flex items-center gap-2 font-semibold " +
            (liked ? "text-coral" : "text-ink/50")
          }
        >
          <Heart size={19} fill={liked ? "currentColor" : "none"} />
          {likes}
        </button>
        <Link
          to={"/posts/" + current._id}
          className="flex items-center gap-2 font-semibold text-ink/50"
        >
          <MessageCircle size={19} />
          {current.commentsCount || 0}
        </Link>
        <span className="ml-auto rounded-full bg-forest/5 px-3 py-1 text-xs font-bold uppercase tracking-wide">
          {current.type}
        </span>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <form
            onSubmit={saveEdit}
            className="card relative w-full max-w-xl space-y-4 p-7"
          >
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="absolute right-5 top-5 rounded-full p-1 hover:bg-mint"
              aria-label="Close edit form"
            >
              <X />
            </button>
            <h2 className="text-2xl">Edit post</h2>
            <label className="label">
              Content
              <textarea
                className="field mt-1 min-h-44 resize-y"
                required
                maxLength={3000}
                value={editForm.content}
                onChange={(e) =>
                  setEditForm({ ...editForm, content: e.target.value })
                }
              />
            </label>
            <label className="label">
              Post type
              <select
                className="field mt-1"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({ ...editForm, type: e.target.value })
                }
              >
                {["general", "need", "offer", "event", "alert"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="label">
              Hashtags
              <input
                className="field mt-1"
                placeholder="neighbourhood help local"
                value={editForm.hashtags}
                onChange={(e) =>
                  setEditForm({ ...editForm, hashtags: e.target.value })
                }
              />
            </label>
            <button disabled={saving} className="btn-primary w-full">
              <Save size={17} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}


