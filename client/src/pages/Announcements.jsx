import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import { errMsg } from "../utils/format";

const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
  });

// Everyone reads. HR can also post and delete.
export default function Announcements() {
  const { user } = useAuth();
  const isHR = user.role === "hr";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/announcements");
      setItems(res.data.announcements);
    } catch (err) {
      setError(errMsg(err, "Could not load announcements"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const post = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await api.post("/announcements", form);
      setForm({ title: "", body: "" });
      setSuccess("Posted");
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not post"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/announcements/${id}`);
      setSuccess("Deleted");
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not delete"));
    }
  };

  return (
    <PageShell title="Announcements" subtitle="Company news and updates." error={error} success={success}>
      {isHR && (
        <form onSubmit={post} className="card card-body shadow-sm mb-4">
          <h5 className="mb-3">Post an announcement</h5>
          <label className="form-label">Title</label>
          <input className="form-control mb-3" maxLength={120} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <label className="form-label">Message</label>
          <textarea className="form-control mb-3" rows={3} maxLength={2000} value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          <div>
            <button className="btn btn-dark" disabled={busy}>{busy ? "Posting..." : "Post"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="spinner-border" role="status" />
      ) : items.length === 0 ? (
        <p className="text-muted">No announcements yet.</p>
      ) : (
        items.map((a) => (
          <div className="card shadow-sm mb-3" key={a._id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="card-title">{a.title}</h5>
                {isHR && (
                  <button className="btn btn-outline-danger btn-sm" onClick={() => remove(a._id)}>Delete</button>
                )}
              </div>
              <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>{a.body}</p>
              <small className="text-muted">
                {a.postedBy?.name || "HR"} · {when(a.createdAt)}
              </small>
            </div>
          </div>
        ))
      )}
    </PageShell>
  );
}
