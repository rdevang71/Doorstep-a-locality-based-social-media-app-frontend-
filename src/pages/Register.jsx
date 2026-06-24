import { Store, UserRound, Users } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthShell } from "./Login";

const accountOptions = [
  { value: "user", label: "User", description: "Join and connect with your neighbourhood.", Icon: UserRound },
  { value: "business", label: "Business", description: "Create an account and publish your business page.", Icon: Store },
  { value: "community", label: "Community", description: "Start a community and become its first member.", Icon: Users },
];

const businessCategories = [
  "Agriculture & Farming",
  "Automotive",
  "Bakery & Confectionery",
  "Beauty & Personal Care",
  "Books & Stationery",
  "Café & Coffee Shop",
  "Childcare & Daycare",
  "Clothing & Fashion",
  "Construction & Contractors",
  "Consulting",
  "Education & Coaching",
  "Electronics & Appliances",
  "Entertainment",
  "Event Planning",
  "Financial Services",
  "Fitness & Wellness",
  "Florist & Gifts",
  "Food & Restaurant",
  "Furniture & Home Décor",
  "Grocery & General Store",
  "Hardware & Building Materials",
  "Healthcare & Medical",
  "Home Services",
  "Hotel & Accommodation",
  "Insurance",
  "Jewellery & Accessories",
  "Legal Services",
  "Logistics & Delivery",
  "Manufacturing",
  "Marketing & Advertising",
  "Mobile & Computer Services",
  "Pet Care",
  "Photography & Videography",
  "Printing & Packaging",
  "Professional Services",
  "Real Estate",
  "Repairs & Maintenance",
  "Retail",
  "Security Services",
  "Sports & Recreation",
  "Technology & Software",
  "Tours & Travel",
  "Transportation",
  "Wholesale & Distribution",
  "Other",
];

export default function Register() {
  const [f, setF] = useState({
    accountType: "user",
    name: "",
    email: "",
    password: "",
    city: "",
    locality: "",
    pincode: "",
    businessName: "",
    businessCategory: "",
    communityName: "",
    organizationDescription: "",
    communityPrivate: false,
  });
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const set = (key, value) => setF((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await register(f);
      toast.success(
        user.role === "user"
          ? "Welcome to LocalConnect"
          : (user.role === "business" ? "Business" : "Community") + " created successfully",
      );
      nav(
        user.role === "business"
          ? "/businesses"
          : user.role === "community"
            ? "/communities"
            : "/",
      );
    } catch (x) {
      toast.error(x.response?.data?.message || "Could not register");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Meet your neighbourhood"
      subtitle="Choose how you want to join, then tell us where you belong."
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <span className="label">Register as</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Account type">
            {accountOptions.map(({ value, label, description, Icon }) => {
              const active = f.accountType === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("accountType", value)}
                  className={
                    "rounded-2xl border p-3 text-left transition " +
                    (active
                      ? "border-forest bg-mint text-forest ring-2 ring-forest/10 dark:border-lime/40 dark:text-white"
                      : "border-forest/15 bg-white hover:border-forest/40")
                  }
                >
                  <Icon size={20} className={active ? "text-coral" : "text-ink/45"} />
                  <span className="mt-2 block font-bold">{label}</span>
                  <span className={"mt-1 block text-xs leading-4 " + (active ? "text-forest/70 dark:text-white/70" : "text-ink/50")}>{description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="label">
          Full name
          <input className="field mt-1" required maxLength={60} value={f.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="label">
          Email
          <input className="field mt-1" type="email" required value={f.email} onChange={(e) => set("email", e.target.value)} />
        </label>

        {f.accountType === "business" && (
          <>
            <label className="label">
              Business name
              <input className="field mt-1" required value={f.businessName} onChange={(e) => set("businessName", e.target.value)} />
            </label>
            <label className="label">
              Business category
              <select
                className="field mt-1"
                required
                value={f.businessCategory}
                onChange={(e) => set("businessCategory", e.target.value)}
              >
                <option value="" disabled>Select a category</option>
                {businessCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </>
        )}

        {f.accountType === "community" && (
          <label className="label sm:col-span-2">
            Community name
            <input className="field mt-1" required value={f.communityName} onChange={(e) => set("communityName", e.target.value)} />
          </label>
        )}

        {f.accountType !== "user" && (
          <label className="label sm:col-span-2">
            Description
            <textarea
              className="field mt-1 min-h-24 resize-y"
              placeholder={"Tell neighbours about your " + f.accountType}
              value={f.organizationDescription}
              onChange={(e) => set("organizationDescription", e.target.value)}
            />
          </label>
        )}

        <label className="label">
          City
          <input className="field mt-1" required value={f.city} onChange={(e) => set("city", e.target.value)} />
        </label>
        <label className="label">
          Locality
          <input className="field mt-1" required value={f.locality} onChange={(e) => set("locality", e.target.value)} />
        </label>
        <label className="label">
          PIN code
          <input
            className="field mt-1"
            inputMode="numeric"
            pattern="[1-9][0-9]{5}"
            maxLength={6}
            title="Enter a valid 6-digit Indian PIN code"
            required
            value={f.pincode}
            onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
          />
        </label>
        <label className="label">
          Password
          <input className="field mt-1" type="password" minLength={6} required value={f.password} onChange={(e) => set("password", e.target.value)} />
        </label>

        {f.accountType === "community" && (
          <label className="flex items-center gap-3 rounded-2xl bg-mint/60 p-4 text-sm font-semibold sm:col-span-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-forest"
              checked={f.communityPrivate}
              onChange={(e) => set("communityPrivate", e.target.checked)}
            />
            Make this a private community
          </label>
        )}

        <button disabled={busy} className="btn-primary mt-2 sm:col-span-2">
          {busy
            ? "Creating account…"
            : f.accountType === "user"
              ? "Join LocalConnect"
              : "Create " + f.accountType + " account"}
        </button>
        <p className="text-center text-sm sm:col-span-2">
          Already a neighbour?{" "}
          <Link className="font-bold text-coral" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
