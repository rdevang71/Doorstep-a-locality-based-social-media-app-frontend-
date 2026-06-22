import { MapPin, Store } from "lucide-react";
export default function BusinessCard({ item, onAction }) {
  return (
    <div className="card p-5">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-lime">
        <Store />
      </div>
      <h3 className="text-xl">{item.name}</h3>
      <p className="mt-1 text-sm text-ink/55">
        {item.description || item.category}
      </p>
      <p className="mt-4 flex items-center gap-1 text-sm">
        <MapPin size={14} />
        {item.locality}, {item.city}
      </p>
      <button onClick={() => onAction?.(item)} className="btn-soft mt-4 w-full">
        Follow · {item.followers?.length || 0}
      </button>
    </div>
  );
}
