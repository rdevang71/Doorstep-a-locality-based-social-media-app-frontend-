import { Sparkles } from "lucide-react";
import { useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/SummaryCard";
import toast from "react-hot-toast";
export default function AreaSummary() {
  const { user } = useAuth();
  const [f, setF] = useState({
    city: user?.city || "",
    locality: user?.locality || "",
    timeRange: "24h",
  });
  const [result, setResult] = useState();
  const [busy, setBusy] = useState(false);
  const run = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      setResult((await api.post("/summaries/area", f)).data);
    } catch (x) {
      toast.error(x.response?.data?.message || "Could not create summary");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-[2rem] bg-forest p-7 text-white sm:p-10">
        <div className="flex items-center gap-2 text-lime">
          <Sparkles />
          AI AREA SUMMARY
        </div>
        <h1 className="mt-4 max-w-2xl text-4xl sm:text-5xl">
          The whole neighbourhood, in a two-minute read.
        </h1>
        <p className="mt-3 max-w-xl text-white/60">
          We scan recent public posts and organise the useful bits. No endless
          scrolling required.
        </p>
        <form
          onSubmit={run}
          className="mt-8 grid gap-3 rounded-3xl bg-white/10 p-4 sm:grid-cols-4"
        >
          {[
            ["city", "City"],
            ["locality", "Locality"],
          ].map(([k, l]) => (
            <input
              key={k}
              className="field text-ink"
              required={k === "city"}
              placeholder={l}
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
            />
          ))}
          <select
            className="field text-ink"
            value={f.timeRange}
            onChange={(e) => setF({ ...f, timeRange: e.target.value })}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            disabled={busy}
            className="rounded-2xl bg-lime px-4 font-bold text-forest"
          >
            {busy ? "Reading…" : "Summarise"}
          </button>
        </form>
      </div>
      {result && (
        <div className="mt-8">
          <SummaryCard summary={result} />
        </div>
      )}
    </main>
  );
}
