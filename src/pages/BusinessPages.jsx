import { Plus, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import { onRealtime } from "../api/realtime";
import BusinessCard from "../components/BusinessCard";
import HashtagInput from "../components/HashtagInput";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const emptyBusiness = {
  name: "",
  description: "",
  category: "",
  city: "",
  locality: "",
};

export default function BusinessPages() {
  const { user, loading } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [postForm, setPostForm] = useState({
    content: "",
    type: "offer",
    hashtags: [],
  });
  const [businessForm, setBusinessForm] = useState(emptyBusiness);
  const [creatingBusiness, setCreatingBusiness] = useState(false);
  const [posting, setPosting] = useState(false);

  const ownedBusinesses = useMemo(
    () =>
      businesses.filter(
        (business) =>
          user && String(business.owner?._id || business.owner) === String(user.id || user._id),
      ),
    [businesses, user],
  );

  const selectedBusiness = ownedBusinesses.find(
    (business) => business._id === selectedBusinessId,
  );

  const loadBusinesses = (signal) => {
    const city = user?.city?.trim();
    const queries = city ? [{ city }, {}] : [{}];

    const run = async () => {
      for (const query of queries) {
        const { data } = await api.get("/business-pages", {
          params: query,
          signal,
        });
        if (data?.length || query === queries[queries.length - 1]) {
          return data || [];
        }
      }
      return [];
    };

    return run()
      .then(setBusinesses)
      .catch((error) => {
        if (error.name !== "CanceledError") setBusinesses([]);
      });
  };

  const loadPosts = (signal, businessId = selectedBusinessId) => {
    const city = user?.city?.trim();
    const queries = businessId
      ? [{ businessPageId: businessId }]
      : city
        ? [
            { city, businessOnly: true },
            { businessOnly: true },
          ]
        : [{ businessOnly: true }];

    const run = async () => {
      for (const query of queries) {
        const { data } = await api.get("/posts", { params: query, signal });
        if (data.posts?.length || query === queries[queries.length - 1]) {
          return data.posts || [];
        }
      }
      return [];
    };

    return run()
      .then(setPosts)
      .catch((error) => {
        if (error.name !== "CanceledError") setPosts([]);
      });
  };

  useEffect(() => {
    if (loading) return undefined;

    const controller = new AbortController();
    const refreshBusinesses = () => loadBusinesses();
    const refreshPosts = () => loadPosts();
    const unsubscribers = [
      onRealtime("business-pages:changed", refreshBusinesses),
      onRealtime("posts:created", refreshPosts),
      onRealtime("posts:updated", refreshPosts),
      onRealtime("posts:deleted", refreshPosts),
      onRealtime("posts:liked", refreshPosts),
      onRealtime("posts:commented", refreshPosts),
    ];

    loadBusinesses(controller.signal);
    loadPosts(controller.signal);

    return () => {
      controller.abort();
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [loading, user?.city, selectedBusinessId]);

  useEffect(() => {
    setBusinessForm((current) => ({
      ...current,
      city: current.city || user?.city || "",
      locality: current.locality || user?.locality || "",
    }));
  }, [user?.city, user?.locality]);

  useEffect(() => {
    if (!selectedBusinessId && ownedBusinesses.length) {
      setSelectedBusinessId(ownedBusinesses[0]._id);
    }
  }, [ownedBusinesses, selectedBusinessId]);

  const createBusiness = async (e) => {
    e.preventDefault();
    try {
      await api.post("/business-pages", businessForm);
      setCreatingBusiness(false);
      setBusinessForm({
        ...emptyBusiness,
        city: user?.city || "",
        locality: user?.locality || "",
      });
      await loadBusinesses();
      toast.success("Business page created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create business");
    }
  };

  const createBusinessPost = async (e) => {
    e.preventDefault();
    if (!selectedBusinessId) {
      toast.error("Create or select one of your business pages first");
      return;
    }

    setPosting(true);
    try {
      await api.post("/posts", {
        businessPageId: selectedBusinessId,
        content: postForm.content,
        type: postForm.type,
        hashtags: postForm.hashtags.join(" "),
      });
      setPostForm({ content: "", type: "offer", hashtags: [] });
      await loadPosts(undefined, selectedBusinessId);
      toast.success("Business update posted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not post update");
    } finally {
      setPosting(false);
    }
  };

  const followBusiness = async (item) => {
    try {
      await api.put(`/business-pages/${item._id}/follow`);
      await loadBusinesses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign in to continue");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bold text-coral">LOCAL BUSINESSES</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Shop the neighbourhood</h1>
        </div>
        {user && (
          <button onClick={() => setCreatingBusiness(true)} className="btn-primary self-start">
            <Plus size={18} />
            Create business
          </button>
        )}
      </div>

      <div className="mt-9 grid gap-7 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
        <section className="space-y-6">
          <form onSubmit={createBusinessPost} className="card space-y-5 p-6 sm:p-7">
            <div>
              <p className="font-bold text-coral">BUSINESS UPDATE</p>
              <h2 className="mt-1 text-3xl">Post as your business</h2>
            </div>

            {ownedBusinesses.length ? (
              <>
                <label className="label">
                  Business page
                  <select
                    className="field mt-1"
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    required
                  >
                    {ownedBusinesses.map((business) => (
                      <option key={business._id} value={business._id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  className="field min-h-40 resize-y text-lg"
                  required
                  maxLength={3000}
                  placeholder={`Share an offer, update, new arrival, or announcement${selectedBusiness ? ` from ${selectedBusiness.name}` : ""}...`}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                />
                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <label className="label">
                    Post type
                    <select
                      className="field mt-1"
                      value={postForm.type}
                      onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                    >
                      {['offer', 'general', 'event', 'alert'].map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </label>
                  <label className="label">
                    Hashtags
                    <HashtagInput
                      value={postForm.hashtags}
                      onChange={(hashtags) => setPostForm({ ...postForm, hashtags })}
                    />
                  </label>
                </div>
                <div className="flex justify-end">
                  <button disabled={posting || !postForm.content.trim()} className="btn-primary">
                    <Send size={18} />
                    {posting ? "Posting..." : "Post update"}
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-mint p-5 text-sm text-ink/65">
                Create a business page first, then you can publish updates from it here.
              </div>
            )}
          </form>

          <div className="space-y-5">
            <div>
              <p className="font-bold text-coral">
                {selectedBusiness ? selectedBusiness.name.toUpperCase() : "BUSINESS FEED"}
              </p>
              <h2 className="mt-1 text-3xl">Recent business updates</h2>
            </div>
            {posts.length ? (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdated={(updated) =>
                    setPosts((current) =>
                      current.map((item) => (item._id === updated._id ? updated : item)),
                    )
                  }
                  onDeleted={(postId) =>
                    setPosts((current) => current.filter((item) => item._id !== postId))
                  }
                />
              ))
            ) : (
              <div className="card p-10 text-center text-ink/50">
                No business updates yet.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div>
            <p className="font-bold text-coral">DIRECTORY</p>
            <h2 className="mt-1 text-3xl">Business cards</h2>
          </div>
          <div className="grid gap-5">
            {businesses.map((business) => (
              <BusinessCard key={business._id} item={business} onAction={followBusiness} />
            ))}
          </div>
          {!businesses.length && (
            <div className="card p-8 text-center text-ink/50">
              No businesses here yet.
            </div>
          )}
        </aside>
      </div>

      {creatingBusiness && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <form onSubmit={createBusiness} className="card relative w-full max-w-lg space-y-4 p-7">
            <button
              type="button"
              onClick={() => setCreatingBusiness(false)}
              className="absolute right-5 top-5 rounded-full p-1 hover:bg-mint"
              aria-label="Close create business form"
            >
              <X />
            </button>
            <h2 className="text-2xl">Create business page</h2>
            {[
              ["name", "Business name"],
              ["description", "What do you offer?"],
              ["category", "Category"],
              ["city", "City"],
              ["locality", "Locality"],
            ].map(([key, label]) => (
              <label className="label" key={key}>
                {label}
                <input
                  className="field mt-1"
                  required={!['description', 'locality'].includes(key)}
                  value={businessForm[key]}
                  onChange={(e) =>
                    setBusinessForm({ ...businessForm, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <button className="btn-primary w-full">Create business</button>
          </form>
        </div>
      )}
    </main>
  );
}

