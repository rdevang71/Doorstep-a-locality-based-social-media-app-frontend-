import { Check, MapPin, Upload, UserMinus, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const sameId = (a, b) => String(a?._id || a) === String(b?._id || b);
const listText = (value) => Array.isArray(value) ? value.join(", ") : value || "";
const editableFields = [
  ["name", "Name"],
  ["occupation", "Occupation"],
  ["education", "Education"],
  ["city", "City"],
  ["locality", "Locality"],
  ["pincode", "PIN code"],
  ["interests", "Interests (comma separated)"],
  ["hobbies", "Hobbies (comma separated)"],
];

export default function Profile() {
  const { id } = useParams();
  const { user, updateMe } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const myId = user?.id || user?._id;
  const profileId = id || myId;
  const isMe = Boolean(myId && sameId(profileId, myId));

  const avatarPreview = useMemo(
    () => (form.avatarFile ? URL.createObjectURL(form.avatarFile) : profile?.avatar || ""),
    [form.avatarFile, profile?.avatar],
  );

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const friendship = useMemo(() => {
    if (!user || !profile || isMe) return "none";
    if (profile.friends?.some((friend) => sameId(friend, myId))) return "friends";
    if (profile.friendRequests?.some((request) => sameId(request.from, myId))) return "sent";
    if (user.friendRequests?.some((request) => sameId(request.from, profile._id))) return "received";
    return "none";
  }, [profile, user, isMe, myId]);

  const load = () =>
    api.get(profileId ? `/users/${profileId}` : "/users/me").then((r) => {
      setProfile(r.data);
      setForm({
        name: r.data.name || "",
        avatarFile: null,
        bio: r.data.bio || "",
        interests: listText(r.data.interests),
        hobbies: listText(r.data.hobbies),
        occupation: r.data.occupation || "",
        education: r.data.education || "",
        city: r.data.city || "",
        locality: r.data.locality || "",
        pincode: r.data.pincode || "",
      });
    });

  useEffect(() => {
    load().catch(() => toast.error("Could not load profile"));
  }, [profileId]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = new FormData();
      editableFields.forEach(([key]) => body.append(key, form[key] || ""));
      body.append("bio", form.bio || "");
      if (form.avatarFile) body.append("avatar", form.avatarFile);

      const data = await updateMe(body);
      setProfile(data);
      setForm((current) => ({ ...current, avatarFile: null }));
      setEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  const sendRequest = async () => {
    setBusy(true);
    try {
      await api.put(`/users/${profile._id}/friend-request`);
      await load();
      toast.success("Friend request sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send request");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (action, targetId = profile._id) => {
    setBusy(true);
    try {
      const { data } = await api.put(`/users/${targetId}/friend-${action}`);
      if (isMe) setProfile(data);
      else await load();
      toast.success(action === "accept" ? "Friend request accepted" : "Friend request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update request");
    } finally {
      setBusy(false);
    }
  };

  const unfriend = async () => {
    setBusy(true);
    try {
      await api.put(`/users/${profile._id}/friend-remove`);
      await load();
      toast.success("Friend removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove friend");
    } finally {
      setBusy(false);
    }
  };
  if (!profile) return <main className="mx-auto max-w-5xl px-4 py-10">Loading profile...</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <section className="card overflow-hidden">
        <div className="bg-mint p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-[1.75rem] bg-forest text-4xl font-bold text-lime">
              {profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : profile.name?.[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl">{profile.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-ink/55"><MapPin size={16} /> {[profile.locality, profile.city].filter(Boolean).join(", ")}</p>
            </div>
            {isMe ? (
              <button onClick={() => setEditing((value) => !value)} className="btn-primary">Edit profile</button>
            ) : friendship === "friends" ? (
              <button disabled={busy} onClick={unfriend} className="btn-soft text-coral"><UserMinus size={17} /> Unfriend</button>
            ) : friendship === "sent" ? (
              <span className="btn-soft">Request sent</span>
            ) : friendship === "received" ? (
              <div className="flex gap-2"><button onClick={() => decide("accept")} className="btn-primary"><Check size={16} /> Accept</button><button onClick={() => decide("reject")} className="btn-soft text-coral"><X size={16} /> Reject</button></div>
            ) : (
              <button disabled={busy} onClick={sendRequest} className="btn-primary"><UserPlus size={17} /> Add friend</button>
            )}
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div><p className="font-bold text-coral">BIO</p><p className="mt-2 text-ink/65">{profile.bio || "No bio yet."}</p></div>
          <div><p className="font-bold text-coral">WORK / EDUCATION</p><p className="mt-2 text-ink/65">{[profile.occupation, profile.education].filter(Boolean).join(" - ") || "Not added yet."}</p></div>
          <div><p className="font-bold text-coral">INTERESTS</p><p className="mt-2 text-ink/65">{listText(profile.interests) || "Not added yet."}</p></div>
          <div><p className="font-bold text-coral">HOBBIES</p><p className="mt-2 text-ink/65">{listText(profile.hobbies) || "Not added yet."}</p></div>
          <div className="sm:col-span-2"><p className="font-bold text-coral">FRIENDS</p><div className="mt-3 flex flex-wrap gap-2">{profile.friends?.length ? profile.friends.map((friend) => <Link key={friend._id} to={`/profile/${friend._id}`} className="rounded-full bg-mint px-4 py-2 font-semibold">{friend.name}</Link>) : <span className="text-ink/50">No friends yet.</span>}</div></div>
          {isMe && (
            <div className="sm:col-span-2">
              <p className="font-bold text-coral">FRIEND REQUESTS</p>
              <div className="mt-3 grid gap-3">
                {profile.friendRequests?.length ? (
                  profile.friendRequests.map((request) => {
                    const requester = request.from;
                    if (!requester) return null;
                    return (
                      <div key={requester._id} className="flex flex-col gap-3 rounded-2xl border border-forest/15 bg-mint/40 p-4 sm:flex-row sm:items-center">
                        <Link to={`/profile/${requester._id}`} className="flex flex-1 items-center gap-3 font-semibold hover:text-coral">
                          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-forest text-lg font-bold text-lime">
                            {requester.avatar ? <img src={requester.avatar} alt="" className="h-full w-full object-cover" /> : requester.name?.[0] || "?"}
                          </span>
                          <span>
                            <span className="block">{requester.name}</span>
                            <span className="text-sm font-medium text-ink/50">{[requester.locality, requester.city].filter(Boolean).join(", ") || "Wants to connect"}</span>
                          </span>
                        </Link>
                        <div className="flex gap-2">
                          <button disabled={busy} onClick={() => decide("accept", requester._id)} className="btn-primary"><Check size={16} /> Accept</button>
                          <button disabled={busy} onClick={() => decide("reject", requester._id)} className="btn-soft text-coral"><X size={16} /> Reject</button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-ink/50">No pending friend requests.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {editing && (
        <form onSubmit={save} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <div className="label sm:col-span-2">
            Profile photo
            <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-forest/15 bg-mint/40 p-4 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-forest text-3xl font-bold text-lime">
                {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className="h-full w-full object-cover" /> : profile.name?.[0]}
              </div>
              <label className="btn-soft w-fit cursor-pointer">
                <Upload size={17} />
                Upload profile pic
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setForm({ ...form, avatarFile: e.target.files?.[0] || null })}
                />
              </label>
              <span className="text-sm font-medium text-ink/55">JPG, PNG, WEBP or GIF up to 5MB.</span>
            </div>
          </div>

          {editableFields.map(([key, label]) => (
            <label key={key} className="label">{label}<input className="field mt-1" value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>
          ))}
          <label className="label sm:col-span-2">Bio<textarea className="field mt-1 min-h-28 resize-y" value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
          <button disabled={busy} className="btn-primary sm:col-span-2">{busy ? "Saving..." : "Save profile"}</button>
        </form>
      )}
    </main>
  );
}

