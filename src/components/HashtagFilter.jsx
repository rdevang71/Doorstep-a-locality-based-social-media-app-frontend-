export default function HashtagFilter({ value, onChange }) {
  return (
    <input
      className="field"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/^#/, "").toLowerCase())}
      placeholder="Filter by #hashtag"
    />
  );
}
