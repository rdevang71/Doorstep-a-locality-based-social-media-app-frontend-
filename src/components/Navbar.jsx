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
import api from "../api/axiosInstance";
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
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("lc_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    let active = true;
    const loadUnreadNotifications = () =>
      api
        .get("/notifications")
        .then((response) => {
          if (!active) return;
          setUnreadNotifications((response.data || []).filter((item) => !item.read).length);
        })
        .catch(() => {
          if (active) setUnreadNotifications(0);
        });

    loadUnreadNotifications();
    const interval = window.setInterval(loadUnreadNotifications, 30000);
    window.addEventListener("focus", loadUnreadNotifications);
    window.addEventListener("localconnect:notifications-changed", loadUnreadNotifications);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadUnreadNotifications);
      window.removeEventListener("localconnect:notifications-changed", loadUnreadNotifications);
    };
  }, [user]);

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
                <Link
                  to="/notifications"
                  className={`relative grid h-10 w-10 place-items-center rounded-full transition ${unreadNotifications ? "text-coral hover:bg-coral/10 dark:text-coral dark:hover:bg-coral/15" : "text-forest hover:bg-mint dark:text-white/75 dark:hover:bg-white/10"}`}
                  aria-label={`Open notifications, ${unreadNotifications} unread`}
                  title={`${unreadNotifications} unread notification${unreadNotifications === 1 ? "" : "s"}`}
                >
                  <Bell size={20} />
                  <span
                    className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold leading-none ${unreadNotifications ? "bg-coral text-white" : "bg-mint text-forest ring-1 ring-forest/15 dark:bg-white/15 dark:text-white"}`}
                  >
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Log out"
                  className="rounded-full p-2 text-forest transition hover:bg-mint dark:text-white/75 dark:hover:bg-white/10"
                >
                  <LogOut size={20} />
                </button>
                <Link
                  to={`/profile/${user.id || user._id}`}
                  className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-coral font-bold text-white"
                  aria-label="Open profile"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user.name?.[0]
                  )}
                </Link>
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



