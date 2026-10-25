import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth, homePath } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

// 2026-11-03T00:00:00.000Z -> "03 Nov 2026"
const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const emptyForm = { type: "casual", fromDate: "", toDate: "", reason: "" };

// Employees and managers: apply for leave and see their own requests
export default function Leaves() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/leaves/me");
      setLeaves(res.data.leaves);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not load your leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await api.post("/leaves", form);
      setForm(emptyForm);
      setSuccess("Leave request sent");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not send the request");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/leaves/${id}`);
      setSuccess("Leave request cancelled");
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not cancel");
    }
  };

  return (
    <div className="container py-4">
      <Link to={homePath(user.role)} className="text-decoration-none">
        &larr; Dashboard
      </Link>
      <h2 className="fw-bold mt-2 mb-4">My Leave</h2>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      <form onSubmit={submit} className="card card-body shadow-sm mb-4">
        <h5 className="mb-3">Apply for leave</h5>
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label">Type</label>
            <select name="type" className="form-select" value={form.type} onChange={change}>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">From</label>
            <input type="date" name="fromDate" className="form-control" value={form.fromDate} onChange={change} required />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">To</label>
            <input type="date" name="toDate" className="form-control" value={form.toDate} min={form.fromDate} onChange={change} required />
          </div>
          <div className="col-12">
            <label className="form-label">Reason</label>
            <textarea name="reason" className="form-control" rows={2} maxLength={500} value={form.reason} onChange={change} required />
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-dark" disabled={busy}>
            {busy ? "Sending..." : "Send request"}
          </button>
        </div>
      </form>

      <h5 className="mb-3">My requests</h5>
      {loading ? (
        <div className="spinner-border" role="status" />
      ) : leaves.length === 0 ? (
        <p className="text-muted">You have not applied for any leave yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td className="text-capitalize">{l.type}</td>
                  <td>{fmt(l.fromDate)}</td>
                  <td>{fmt(l.toDate)}</td>
                  <td>{l.days}</td>
                  <td style={{ maxWidth: 220 }}>{l.reason}</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="text-muted small">
                    {l.reviewedBy ? `By ${l.reviewedBy.name}` : ""}
                    {l.reviewNote ? `: ${l.reviewNote}` : ""}
                  </td>
                  <td>
                    {l.status === "pending" && (
                      <button className="btn btn-outline-danger btn-sm" onClick={() => cancel(l.id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
