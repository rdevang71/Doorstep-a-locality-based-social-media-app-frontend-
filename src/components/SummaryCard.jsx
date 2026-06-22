import {
  CalendarDays,
  HandHelping,
  Lightbulb,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
export default function SummaryCard({ summary }) {
  const groups = [
    ["Highlights", summary.highlights, Sparkles],
    ["Events happening", summary.events, CalendarDays],
    ["Business offers", summary.businessOffers, ShoppingBag],
    ["Help & service needs", summary.serviceNeeds, HandHelping],
    ["Popular topics", summary.trendingTopics, Lightbulb],
  ];
  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="font-semibold text-coral">
            {summary.totalPostsAnalyzed} posts analysed
          </p>
          <h2 className="mt-1 text-3xl">What’s happening in {summary.area}</h2>
        </div>
        <Sparkles className="text-coral" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(([title, items, Icon]) => (
          <section key={title} className="rounded-2xl bg-cream p-5">
            <h3 className="mb-3 flex items-center gap-2 text-lg">
              <Icon size={18} />
              {title}
            </h3>
            {items?.length ? (
              <ul className="space-y-2 text-sm leading-6">
                {items.slice(0, 6).map((v, i) => (
                  <li key={i}>
                    • {typeof v === "string" ? v : JSON.stringify(v)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink/45">Nothing notable yet.</p>
            )}
          </section>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {summary.trendingHashtags?.map((t) => (
          <span
            key={t.hashtag || t}
            className="rounded-full bg-mint px-3 py-1 font-semibold"
          >
            #{t.hashtag || t}
          </span>
        ))}
      </div>
    </div>
  );
}
