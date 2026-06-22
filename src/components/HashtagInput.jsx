import { X } from "lucide-react";
import { useState } from "react";
export default function HashtagInput({ value = [], onChange }) {
  const [text, setText] = useState("");
  const add = () => {
    const incoming = text
      .split(/[\s,]+/)
      .map((t) => t.replace(/^#+/, "").toLowerCase())
      .filter(Boolean);
    onChange([...new Set([...value, ...incoming])]);
    setText("");
  };
  return (
    <div>
      <div className="flex min-h-14 flex-wrap gap-2 rounded-2xl border border-forest/15 bg-white p-2 focus-within:ring-4 focus-within:ring-mint">
        {value.map((t) => (
          <span
            className="flex items-center gap-1 rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest"
            key={t}
          >
            #{t}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== t))}
            >
              <X size={13} />
            </button>
          </span>
        ))}
        <input
          className="min-w-32 flex-1 bg-transparent px-2"
          value={text}
          placeholder="#food #cricket"
          onChange={(e) => setText(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (["Enter", ",", " "].includes(e.key)) {
              e.preventDefault();
              add();
            }
          }}
        />
      </div>
    </div>
  );
}
