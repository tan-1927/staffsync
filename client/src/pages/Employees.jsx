import { useEffect, useState } from "react";
import api from "../api/axios";
import PageShell from "../components/PageShell";
import { fmtDate, money, errMsg } from "../utils/format";

const empty = {
  name: "", email: "", password: "", role: "employee",
  department: "", designation: "", salary: "", joinDate: "", manager: "",
};

// HR: add, edit and remove people
export default function Employees() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(errMsg(err, "Could not load people"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (u) => {
    setEditingId(u._id);
    setForm({
      name: u.name, email: u.email, password: "", role: u.role,
      department: u.department || "", designation: u.designation || "",
      salary: u.salary ?? "", joinDate: u.joinDate ? u.joinDate.slice(0, 10) : "",
      manager: u.manager?._id || "",
    });
    setError("");
    setSuccess("");
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
      const body = { ...form };
      if (editingId && !body.password) delete body.password; // blank = keep the old password
      if (editingId) {
        await api.put(`/users/${editingId}`, body);
        setSuccess("Saved");
      } else {
        await api.post("/users", body);
        setSuccess("Person added");
      }
      reset();
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not save"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? Their leave and attendance records are deleted too.`)) return;
    setError("");
    setSuccess("");
    try {
      await api.delete(`/users/${u._id}`);
      setSuccess("Deleted");
      if (editingId === u._id) reset();
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not delete"));
    }
  };

  const q = search.trim().toLowerCase();
  const shown = users.filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q)
  );
  const managers = users.filter((u) => u.role !== "employee" && u._id !== editingId);

  return (
    <PageShell title="Employees" subtitle="Add, edit and remove people." error={error} success={success}>
      <form onSubmit={submit} className="card card-body shadow-sm mb-4">
        <h5 className="mb-3">{editingId ? "Edit person" : "Add a person"}</h5>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label">Full name</label>
            <input name="name" className="form-control" value={form.name} onChange={change} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">Email</label>
            <input type="email" name="email" className="form-control" value={form.email} onChange={change} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label">{editingId ? "New password (optional)" : "Password"}</label>
            <input
              type="password" name="password" className="form-control" value={form.password}
              onChange={change} minLength={6} required={!editingId}
              placeholder={editingId ? "Leave blank to keep" : "Min 6 characters"}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={change}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Department</label>
            <input name="department" className="form-control" value={form.department} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Designation</label>
            <input name="designation" className="form-control" value={form.designation} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Salary (₹/month)</label>
            <input type="number" min="0" name="salary" className="form-control" value={form.salary} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Join date</label>
            <input type="date" name="joinDate" className="form-control" value={form.joinDate} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Reports to</label>
            <select name="manager" className="form-select" value={form.manager} onChange={change}>
              <option value="">None</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button className="btn btn-dark me-2" disabled={busy}>
            {busy ? "Saving..." : editingId ? "Save changes" : "Add person"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline-secondary" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">People ({shown.length})</h5>
        <input
          className="form-control form-control-sm" style={{ maxWidth: 260 }}
          placeholder="Search name, email, department" value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="spinner-border" role="status" />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th><th>Role</th><th>Department</th><th>Designation</th>
                <th>Salary</th><th>Joined</th><th>Reports to</th><th />
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u._id}>
                  <td>
                    {u.name}
                    <div className="text-muted small">{u.email}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border text-uppercase">{u.role}</span></td>
                  <td>{u.department || "-"}</td>
                  <td>{u.designation || "-"}</td>
                  <td>{money(u.salary)}</td>
                  <td>{fmtDate(u.joinDate)}</td>
                  <td>{u.manager?.name || "-"}</td>
                  <td className="text-nowrap">
                    <button className="btn btn-outline-dark btn-sm me-2" onClick={() => startEdit(u)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => remove(u)}>Delete</button>
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
