import { ArrowRight, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import TrendingHashtags from "../components/TrendingHashtags";
import HashtagFilter from "../components/HashtagFilter";
export default function Home() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const tag = params.get("hashtag") || "";
  useEffect(() => {
    const area = user?.pincode ? { pincode: user.pincode } : { city: user?.city };
    const q = { ...area, hashtag: tag };
    api.get("/posts", { params: q }).then((r) => setPosts(r.data.posts));
    api
      .get("/hashtags/trending", { params: area })
      .then((r) => setTags(r.data.hashtags))
      .catch(() => {});
  }, [user?.city, user?.pincode, tag]);
  return (
    <main>
      <section className="border-b border-forest/10 bg-mint/70">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-10 lg:flex-row lg:items-end lg:px-8">
          <div>
            <p className="mb-2 flex items-center gap-2 font-semibold text-coral">
              <MapPin size={17} />
              {user ? `${user.locality}, ${user.city}` : "Your neighbourhood"}
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">
              Closer stories.
              <br />
              Stronger streets.
            </h1>
          </div>
          <Link
            to={user ? "/create" : "/register"}
            className="btn-primary self-start lg:self-auto"
          >
            <Plus size={18} />
            Share something local
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px] lg:px-8">
        <section>
          <div className="mb-6 flex items-center gap-3">
            <HashtagFilter
              value={tag}
              onChange={(v) => setParams(v ? { hashtag: v } : {})}
            />
            {tag && (
              <button onClick={() => setParams({})} className="btn-soft">
                Clear
              </button>
            )}
          </div>
          <div className="space-y-5">
            {posts.length ? (
              posts.map((p) => (
                <PostCard
                  key={p._id}
                  post={p}
                  onUpdated={(updated) =>
                    setPosts((current) =>
                      current.map((item) =>
                        item._id === updated._id ? updated : item,
                      ),
                    )
                  }
                  onDeleted={(postId) =>
                    setPosts((current) =>
                      current.filter((item) => item._id !== postId),
                    )
                  }
                />
              ))
            ) : (
              <div className="card p-12 text-center">
                <h2 className="text-2xl">It’s quiet here—for now.</h2>
                <p className="mt-2 text-ink/50">
                  Be the first to start a local conversation.
                </p>
                <Link className="btn-soft mt-5" to="/create">
                  Create a post <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>
        <div className="space-y-5">
          <TrendingHashtags
            tags={tags}
            onSelect={(v) => setParams({ hashtag: v })}
          />
          <div className="rounded-[1.75rem] bg-forest p-6 text-white">
            <p className="text-sm font-bold text-lime">
              AI NEIGHBOURHOOD BRIEF
            </p>
            <h3 className="mt-2 text-2xl">
              Catch up without the endless scroll.
            </h3>
            <Link
              className="mt-5 inline-flex items-center gap-2 font-bold text-lime"
              to="/summary"
            >
              Summarise my area <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
