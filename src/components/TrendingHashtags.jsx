import { Hash, TrendingUp } from "lucide-react";
export default function TrendingHashtags({ tags = [], onSelect }) {
  return (
    <aside className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={19} className="text-coral" />
        <h3 className="text-lg">Trending nearby</h3>
      </div>
      <div className="space-y-1">
        {tags.length ? (
          tags.map((t, i) => (
            <button
              onClick={() => onSelect?.(t.hashtag)}
              key={t.hashtag}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-mint"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Hash size={15} />
                {t.hashtag}
              </span>
              <small className="text-ink/45">{t.count} posts</small>
            </button>
          ))
        ) : (
          <p className="text-sm text-ink/50">
            Fresh conversations will appear here.
          </p>
        )}
      </div>
    </aside>
  );
}
