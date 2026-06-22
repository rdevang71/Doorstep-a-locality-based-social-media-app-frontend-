import { CalendarDays, MapPin } from "lucide-react";
export default function EventCard({ item, onAction }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-forest p-5 text-white">
        <p className="text-sm font-bold uppercase tracking-wider text-lime">
          {new Date(item.startsAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            weekday: "short",
          })}
        </p>
        <h3 className="mt-2 text-2xl">{item.title}</h3>
      </div>
      <div className="p-5">
        <p className="text-sm text-ink/55">{item.description}</p>
        <p className="mt-4 flex items-center gap-1 text-sm">
          <MapPin size={14} />
          {item.venue || item.locality}, {item.city}
        </p>
        <button
          onClick={() => onAction?.(item)}
          className="btn-soft mt-4 w-full"
        >
          <CalendarDays size={16} />
          I’m interested · {item.attendees?.length || 0}
        </button>
      </div>
    </div>
  );
}
