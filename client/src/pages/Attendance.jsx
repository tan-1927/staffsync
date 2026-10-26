import { useEffect, useState } from "react";
import api from "../api/axios";
import PageShell from "../components/PageShell";
import { fmtDay, fmtTime, worked, errMsg } from "../utils/format";

// Everyone: check in / check out and see my last 31 days
export default function Attendance() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [t, h] = await Promise.all([api.get("/attendance/today"), api.get("/attendance/me")]);
      setToday(t.data.record);
      setHistory(h.data.records);
    } catch (err) {
      setError(errMsg(err, "Could not load attendance"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const mark = async (which) => {
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await api.post(`/attendance/${which}`);
      setSuccess(which === "check-in" ? "Checked in" : "Checked out");
      await load();
    } catch (err) {
      setError(errMsg(err, "Could not mark attendance"));
    } finally {
      setBusy(false);
    }
  };

  const status = !today ? "Not checked in" : today.checkOut ? "Day complete" : "Checked in";

  return (
    <PageShell title="Attendance" subtitle="Check in when you start and check out when you finish." error={error} success={success}>
      <div className="card card-body shadow-sm mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="text-muted small">Today</div>
            <div className="fs-5 fw-semibold">{status}</div>
            {today && (
              <div className="text-muted small">
                In {fmtTime(today.checkIn)}
                {today.checkOut ? ` · Out ${fmtTime(today.checkOut)} · ${worked(today.checkIn, today.checkOut)}` : ""}
              </div>
            )}
          </div>
          <div>
            <button className="btn btn-success me-2" disabled={busy || !!today} onClick={() => mark("check-in")}>
              Check in
            </button>
            <button className="btn btn-dark" disabled={busy || !today || !!today.checkOut} onClick={() => mark("check-out")}>
              Check out
            </button>
          </div>
        </div>
      </div>

      <h5 className="mb-3">My last 31 days</h5>
      {loading ? (
        <div className="spinner-border" role="status" />
      ) : history.length === 0 ? (
        <p className="text-muted">No attendance yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr><th>Date</th><th>Check in</th><th>Check out</th><th>Hours</th></tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r._id}>
                  <td>{fmtDay(r.date)}</td>
                  <td>{fmtTime(r.checkIn)}</td>
                  <td>{r.checkOut ? fmtTime(r.checkOut) : <span className="text-muted">Not checked out</span>}</td>
                  <td>{worked(r.checkIn, r.checkOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
