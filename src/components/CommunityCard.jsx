import { MapPin, Users } from "lucide-react";
export default function CommunityCard({ item, onAction }) {
  return (
    <div className="card p-5">
      <Users className="mb-3 text-coral" />
      <h3 className="text-xl">{item.name}</h3>
      <p className="mt-2 min-h-10 text-sm text-ink/55">{item.description}</p>
      <p className="mt-4 flex items-center gap-1 text-sm">
        <MapPin size={14} />
        {item.city}
      </p>
      <button onClick={() => onAction?.(item)} className="btn-soft mt-4 w-full">
        Join {item.members?.length || 0} neighbours
      </button>
    </div>
  );
}
