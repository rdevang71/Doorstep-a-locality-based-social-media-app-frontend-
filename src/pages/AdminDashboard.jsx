import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { onRealtime } from "../api/realtime";
export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    const load = () =>
      api
        .get("/reports")
        .then((r) => setReports(r.data || []))
        .catch(() => setReports([]));
    const unsubscribe = onRealtime("reports:changed", load);
    load();
    return unsubscribe;
  }, []);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-bold text-coral">MODERATION</p>
      <h1 className="mt-2 text-4xl">Community health</h1>
      <div className="card mt-8 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-mint">
            <tr>
              {["Type", "Reason", "Status", "Reported"].map((h) => (
                <th key={h} className="p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-4">{r.targetType}</td>
                <td className="p-4">{r.reason}</td>
                <td className="p-4">{r.status}</td>
                <td className="p-4">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reports.length && (
          <p className="p-8 text-center text-ink/50">No reports to review.</p>
        )}
      </div>
    </main>
  );
}

