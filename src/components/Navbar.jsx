import {
  Bell,
  CalendarDays,
  Compass,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const links = [
  ["/", Compass, "Feed"],
  ["/businesses", Store, "Businesses"],
  ["/communities", Users, "Communities"],
  ["/events", CalendarDays, "Events"],
  ["/chat", MessageCircle, "Chat"],
  ["/summary", Sparkles, "Summary"],
];
export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-forest/10 bg-cream/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-lime">
              L
            </span>
            Local<span className="text-coral">Connect</span>
          </Link>
          <nav className="hidden items-center gap-1 xl:flex">
            {links.map(([to, Icon, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${isActive ? "bg-mint text-forest" : "text-ink/60 hover:bg-white"}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/create" className="btn-primary hidden sm:flex">
                  <Plus size={18} />
                  Post
                </Link>
                <button className="rounded-full p-2 hover:bg-white">
                  <Bell size={20} />
                </button>
                <button
                  onClick={logout}
                  title="Log out"
                  className="rounded-full p-2 hover:bg-white"
                >
                  <LogOut size={20} />
                </button>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-coral font-bold text-white">
                  {user.name?.[0]}
                </div>
              </>
            ) : (
              <Link className="btn-primary" to="/login">
                Sign in
              </Link>
            )}
            <button onClick={() => setOpen(!open)} className="p-2 xl:hidden">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t bg-white p-3 xl:hidden">
            {links.map(([to, Icon, label]) => (
              <NavLink
                onClick={() => setOpen(false)}
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl p-3 hover:bg-mint"
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
