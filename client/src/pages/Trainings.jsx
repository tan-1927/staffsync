import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PageShell from "../components/PageShell";
import { fmtDate, errMsg } from "../utils/format";

const statusColor = { scheduled: "bg-primary", completed: "bg-success", cancelled: "bg-secondary" };
const empty = { title: "", description: "", date: "", assignedTo: [] };

// Manager (and HR): create trainings, pick employees, update status
export default function Trainings() {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [t, u] = await Promise.all([api.get("/trainings"), api.get("/users/team")]);
      setTrainings(t.data.trainings);
      setTeam(u.data.users);
    } catch (err) {
      setError(errMsg(err, "Could not load trainings"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const toggle = (id) =>
    setForm((f) => ({
      ...f,
      assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter((x) => x !== id) : [...f.assignedTo, id],
    }));

  const startEdit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title, description: t.description || "", date: t.date.slice(0, 10),
      assignedTo: t.assignedTo.map((u) => u._id),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => {
    setEditingId(null);
    setForm(empty);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (editingId) await api.put(`/trainings/${editingId}`, form);
      else await api.post("/trainings", form);
      setSuccess(editingId ? "Saved" : "Training created");
      reset();
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not save"));
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (t, status) => {
    setError("");
    setSuccess("");
    try {
      await api.put(`/trainings/${t._id}`, { status });
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not update"));
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/trainings/${t._id}`);
      setSuccess("Deleted");
      if (editingId === t._id) reset();
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not delete"));
    }
  };

  return (
    <PageShell
      title="Training & development"
      subtitle={user.role === "hr" ? "All training programs." : "Programs you created for your team."}
      error={error} success={success}
    >
      <form onSubmit={submit} className="card card-body shadow-sm mb-4">
        <h5 className="mb-3">{editingId ? "Edit training" : "Create a training"}</h5>
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <label className="form-label">Title</label>
            <input className="form-control" maxLength={120} value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} maxLength={1000} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-12">
            <label className="form-label d-block">Assign to</label>
            {team.length === 0 ? (
              <span className="text-muted">No employees yet.</span>
            ) : (
              team.map((u) => (
                <div className="form-check form-check-inline" key={u._id}>
                  <input className="form-check-input" type="checkbox" id={`emp-${u._id}`}
                    checked={form.assignedTo.includes(u._id)} onChange={() => toggle(u._id)} />
                  <label className="form-check-label" htmlFor={`emp-${u._id}`}>{u.name}</label>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-dark me-2" disabled={busy}>
            {busy ? "Saving..." : editingId ? "Save changes" : "Create training"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline-secondary" onClick={reset}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="spinner-border" role="status" />
      ) : trainings.length === 0 ? (
        <p className="text-muted">No trainings yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr><th>Training</th><th>Date</th><th>Assigned to</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t._id}>
                  <td>
                    {t.title}
                    {t.description && <div className="text-muted small">{t.description}</div>}
                    {user.role === "hr" && <div className="text-muted small">By {t.createdBy?.name}</div>}
                  </td>
                  <td>{fmtDate(t.date)}</td>
                  <td>{t.assignedTo.length ? t.assignedTo.map((u) => u.name).join(", ") : "-"}</td>
                  <td>
                    <select
                      className={`form-select form-select-sm text-white ${statusColor[t.status]}`}
                      style={{ width: 130 }} value={t.status}
                      onChange={(e) => setStatus(t, e.target.value)}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="text-nowrap">
                    <button className="btn btn-outline-dark btn-sm me-2" onClick={() => startEdit(t)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => remove(t)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
