import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
export default function ResourcePage({
  title,
  eyebrow,
  endpoint,
  Card,
  action,
  fields,
}) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const initial = Object.fromEntries(
    fields.map(([k]) => [
      k,
      k === "city"
        ? user?.city || ""
        : k === "locality"
          ? user?.locality || ""
          : "",
    ]),
  );
  const [form, setForm] = useState(initial);
  const load = () =>
    api
      .get(endpoint, { params: { city: user?.city } })
      .then((r) => setItems(r.data))
      .catch(() => {});
  useEffect(() => {
    load();
  }, [endpoint, user?.city]);
  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoint, form);
      setOpen(false);
      load();
      toast.success("Created successfully");
    } catch (x) {
      toast.error(x.response?.data?.message || "Could not create");
    }
  };
  const act = async (item) => {
    try {
      await api.put(`${endpoint}/${item._id}/${action}`);
      load();
    } catch (x) {
      toast.error(x.response?.data?.message || "Sign in to continue");
    }
  };
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-bold text-coral">{eyebrow}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>
        </div>
        {user && (
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus size={18} />
            Create
          </button>
        )}
      </div>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i._id} item={i} onAction={act} />
        ))}
      </div>
      {!items.length && (
        <div className="card mt-9 p-12 text-center text-ink/50">
          Nothing here yet. Start something good.
        </div>
      )}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <form
            onSubmit={create}
            className="card relative w-full max-w-lg space-y-4 p-7"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5"
            >
              <X />
            </button>
            <h2 className="text-2xl">Create something local</h2>
            {fields.map(([k, l, type = "text"]) => (
              <label className="label" key={k}>
                {l}
                <input
                  className="field mt-1"
                  type={type}
                  required={!["description", "locality", "venue"].includes(k)}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <button className="btn-primary w-full">Create</button>
          </form>
        </div>
      )}
    </main>
  );
}
