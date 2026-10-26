import { useEffect, useState } from "react";
import api from "../api/axios";
import PageShell from "../components/PageShell";
import { fmtDate, money, errMsg } from "../utils/format";

// Everyone: see my record, edit name / phone / address.
// Role, department and salary are set by HR and are read-only here.
export default function Profile() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/users/me/profile")
      .then((res) => {
        setMe(res.data.user);
        const { name, phone, address } = res.data.user;
        setForm({ name, phone: phone || "", address: address || "" });
      })
      .catch((err) => setError(errMsg(err, "Could not load your profile")));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await api.put("/users/me/profile", form);
      setMe(res.data.user);
      setSuccess("Profile saved");
    } catch (err) {
      setError(errMsg(err, "Could not save"));
    } finally {
      setBusy(false);
    }
  };

  const row = (label, value) => (
    <div className="col-6 col-md-4">
      <div className="text-muted small">{label}</div>
      <div>{value || "-"}</div>
    </div>
  );

  return (
    <PageShell title="My profile" subtitle="Keep your contact details up to date." error={error} success={success}>
      {!me ? (
        !error && <div className="spinner-border" role="status" />
      ) : (
        <>
          <div className="card card-body shadow-sm mb-4">
            <h5 className="mb-3">Work record (set by HR)</h5>
            <div className="row g-3">
              {row("Email", me.email)}
              {row("Role", <span className="text-uppercase">{me.role}</span>)}
              {row("Department", me.department)}
              {row("Designation", me.designation)}
              {row("Joined", me.joinDate ? fmtDate(me.joinDate) : "")}
              {row("Salary", me.salary ? money(me.salary) : "")}
              {row("Reports to", me.manager?.name)}
            </div>
          </div>

          <form onSubmit={save} className="card card-body shadow-sm">
            <h5 className="mb-3">Personal details</h5>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label">Full name</label>
                <input className="form-control" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} maxLength={15}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} maxLength={200}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-dark" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </>
      )}
    </PageShell>
  );
}
