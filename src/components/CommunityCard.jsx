import { MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);

export default function CommunityCard({ item, onAction }) {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const isMember = Boolean(userId && item.members?.some((id) => sameId(id, userId)));
  const isPending = Boolean(
    userId && item.joinRequests?.some((request) => sameId(request.user, userId)),
  );
  const buttonLabel = isMember
    ? `Member - ${item.members?.length || 0} neighbours`
    : isPending
      ? "Pending approval"
      : `Request to join ${item.members?.length || 0} neighbours`;

  return (
    <div className="card p-5">
      <Link to={`/communities/${item._id}`} className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral/40">
        <Users className="mb-3 text-coral" />
        <h3 className="text-xl">{item.name}</h3>
        <p className="mt-2 min-h-10 text-sm text-ink/55">{item.description}</p>
        <p className="mt-4 flex items-center gap-1 text-sm">
          <MapPin size={14} />
          {item.city}
        </p>
      </Link>
      <button
        onClick={() => onAction?.(item)}
        disabled={isMember || isPending}
        className="btn-soft mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
