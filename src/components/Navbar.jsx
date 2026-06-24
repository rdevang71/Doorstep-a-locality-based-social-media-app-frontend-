import {
  Bell,
  CalendarDays,
  Compass,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Sparkles,
  Store,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applyTheme, getInitialTheme } from "../utils/theme";
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
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("lc_theme", theme);
  }, [theme]);

  const dark = theme === "dark";
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-forest/15 bg-white/95 text-ink shadow-[0_8px_30px_rgba(11,59,53,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#071814]/95 dark:text-white dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-forest dark:text-white">
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
                  `flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold transition ${isActive ? "bg-forest text-white shadow-sm dark:bg-lime dark:text-forest" : "text-forest/80 hover:bg-mint hover:text-forest dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(dark ? "light" : "dark")}
              title={dark ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              className="grid h-10 w-10 place-items-center rounded-full border border-forest/15 bg-cream text-forest shadow-sm transition hover:border-forest/30 hover:bg-mint dark:border-white/15 dark:bg-white/10 dark:text-lime dark:hover:bg-white/15"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            {user ? (
              <>
                <Link to="/create" className="btn-primary hidden sm:flex">
                  <Plus size={18} />
                  Post
                </Link>
                <button className="rounded-full p-2 text-forest transition hover:bg-mint dark:text-white/75 dark:hover:bg-white/10">
                  <Bell size={20} />
                </button>
                <button
                  onClick={logout}
                  title="Log out"
                  className="rounded-full p-2 text-forest transition hover:bg-mint dark:text-white/75 dark:hover:bg-white/10"
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
            <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-forest hover:bg-mint dark:text-white dark:hover:bg-white/10 xl:hidden">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t bg-white p-3 dark:border-white/10 dark:bg-[#102a25] xl:hidden">
            {links.map(([to, Icon, label]) => (
              <NavLink
                onClick={() => setOpen(false)}
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl p-3 font-semibold text-forest hover:bg-mint dark:text-white/80 dark:hover:bg-white/10"
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
