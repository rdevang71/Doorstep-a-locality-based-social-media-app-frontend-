import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form);
      nav("/");
    } catch (x) {
      toast.error(x.response?.data?.message || "Could not sign in");
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Your neighbourhood has been busy."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="label">
          Email
          <input
            className="field mt-1"
            type="email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="label">
          Password
          <input
            className="field mt-1"
            type="password"
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-center text-sm">
          New here?{" "}
          <Link className="font-bold text-coral" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
export function AuthShell({ title, subtitle, children }) {
  return (
    <main className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      <section className="hidden bg-forest p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="text-2xl font-bold text-lime">LocalConnect</span>
        <div>
          <p className="mb-4 text-lime">THE GOOD STUFF IS CLOSE BY</p>
          <h1 className="max-w-lg text-6xl leading-tight">
            Strangers become neighbours here.
          </h1>
          <div className="mt-10 flex gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2">
              Local news
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              Real help
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2">
              Good people
            </span>
          </div>
        </div>
        <p className="text-white/50">Built for the places we call home.</p>
      </section>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl">{title}</h1>
          <p className="mb-8 mt-2 text-ink/50">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
