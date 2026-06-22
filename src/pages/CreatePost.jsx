import { Image, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import HashtagInput from "../components/HashtagInput";
import toast from "react-hot-toast";
export default function CreatePost() {
  const [f, setF] = useState({ content: "", type: "general", hashtags: [] });
  const [files, setFiles] = useState([]);
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = new FormData();
      body.append("content", f.content);
      body.append("type", f.type);
      body.append("hashtags", f.hashtags.join(" "));
      files.forEach((file) => body.append("images", file));
      await api.post("/posts", body);
      toast.success("Posted to your neighbourhood");
      nav("/");
    } catch (x) {
      toast.error(x.response?.data?.message || "Could not create post");
    }
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-bold text-coral">SAY HELLO TO THE NEIGHBOURHOOD</p>
      <h1 className="mt-2 text-4xl">What’s happening nearby?</h1>
      <form onSubmit={submit} className="card mt-7 space-y-5 p-6 sm:p-8">
        <textarea
          className="field min-h-44 resize-none text-lg"
          required
          maxLength={3000}
          placeholder="Share an update, ask for help, recommend a place…"
          value={f.content}
          onChange={(e) => setF({ ...f, content: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">
            Post type
            <select
              className="field mt-1"
              value={f.type}
              onChange={(e) => setF({ ...f, type: e.target.value })}
            >
              {["general", "need", "offer", "event", "alert"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="label">
            Photos (up to 4)
            <div className="relative mt-1">
              <Image className="absolute left-4 top-3.5" size={18} />
              <input
                className="field pl-11 file:mr-2 file:border-0 file:bg-transparent file:font-semibold"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={(e) => setFiles([...e.target.files].slice(0, 4))}
              />
            </div>
          </label>
        </div>
        <label className="label">
          Hashtags
          <HashtagInput
            value={f.hashtags}
            onChange={(v) => setF({ ...f, hashtags: v })}
          />
        </label>
        <div className="flex justify-end">
          <button className="btn-primary">
            <Send size={18} />
            Publish post
          </button>
        </div>
      </form>
    </main>
  );
}
