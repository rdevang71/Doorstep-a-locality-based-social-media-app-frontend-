import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { onRealtime } from "../api/realtime";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = (showLoading = false) => {
      if (showLoading) setLoading(true);
      return Promise.all([
        api.get("/posts/" + id, { signal: controller.signal }),
        api.get("/posts/" + id + "/comments", { signal: controller.signal }),
      ])
        .then(([postResponse, commentsResponse]) => {
          if (!active) return;
          setPost(postResponse.data);
          setComments(commentsResponse.data.comments || []);
        })
        .catch((error) => {
          if (!active || error.name === "CanceledError") return;
          toast.error(error.response?.data?.message || "Could not load post");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    load(true);

    const samePost = (value) => String(value?._id || value?.postId || "") === String(id);
    const unsubscribers = [
      onRealtime("posts:updated", (updated) => {
        if (samePost(updated)) setPost(updated);
      }),
      onRealtime("posts:deleted", (deleted) => {
        if (samePost(deleted)) navigate("/");
      }),
      onRealtime("posts:liked", (likedPost) => {
        if (samePost(likedPost)) load();
      }),
      onRealtime("comments:created", (payload) => {
        if (!samePost(payload)) return;
        setComments((current) =>
          current.some((comment) => comment._id === payload.comment._id)
            ? current
            : [...current, payload.comment],
        );
        setPost((current) =>
          current
            ? { ...current, commentsCount: payload.commentsCount }
            : current,
        );
      }),
    ];

    return () => {
      active = false;
      controller.abort();
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [id, navigate]);

  const addComment = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/posts/" + id + "/comments", {
        content: trimmed,
      });
      setComments((current) => [...current, data.comment]);
      setPost((current) => ({
        ...current,
        commentsCount: data.commentsCount,
      }));
      setContent("");
      toast.success("Comment added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="card p-10 text-center">Loading post…</div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="card p-10 text-center">Post not found.</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PostCard
        post={post}
        onUpdated={setPost}
        onDeleted={() => navigate("/")}
      />

      <section className="card mt-6 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          <MessageCircle size={20} className="text-coral" />
          <h2 className="text-2xl">
            Comments ({post.commentsCount || comments.length})
          </h2>
        </div>

        {user ? (
          <form onSubmit={addComment} className="flex items-end gap-3">
            <label className="flex-1">
              <span className="sr-only">Write a comment</span>
              <textarea
                className="field min-h-14 resize-y"
                required
                maxLength={1000}
                placeholder="Add to the conversation…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </label>
            <button
              disabled={submitting || !content.trim()}
              className="btn-primary mb-0.5"
              aria-label="Post comment"
            >
              <Send size={17} />
              <span className="hidden sm:inline">
                {submitting ? "Posting…" : "Comment"}
              </span>
            </button>
          </form>
        ) : (
          <p className="rounded-2xl bg-mint p-4 text-sm">
            <Link to="/login" className="font-bold text-coral">Sign in</Link>
            {" "}to join the conversation.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <article key={comment._id} className="rounded-2xl bg-forest/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">
                  {comment.author?.name || "Neighbour"}
                </p>
                <time className="text-xs text-ink/45">
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                {comment.content}
              </p>
            </article>
          ))}
          {!comments.length && (
            <p className="py-6 text-center text-sm text-ink/50">
              No comments yet. Start the conversation.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
