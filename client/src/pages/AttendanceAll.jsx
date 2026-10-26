import { useEffect, useState } from "react";
import api from "../api/axios";
import PageShell from "../components/PageShell";
import { fmtTime, worked, todayIST, errMsg } from "../utils/format";

// HR: see who was present on any day
export default function AttendanceAll() {
  const [date, setDate] = useState(todayIST());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError("");
    api
      .get("/attendance", { params: { date } })
      .then((res) => setRecords(res.data.records))
      .catch((err) => setError(errMsg(err, "Could not load attendance")))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <PageShell title="Company attendance" subtitle="Everyone who checked in on the chosen day." error={error}>
      <div className="mb-3" style={{ maxWidth: 220 }}>
        <label className="form-label">Date</label>
        <input type="date" className="form-control" value={date} max={todayIST()} onChange={(e) => setDate(e.target.value)} />
      </div>

      {loading ? (
        <div className="spinner-border" role="status" />
      ) : records.length === 0 ? (
        <p className="text-muted">Nobody checked in on this day.</p>
      ) : (
        <>
          <p className="text-muted">{records.length} present</p>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr><th>Person</th><th>Department</th><th>Check in</th><th>Check out</th><th>Hours</th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.user?.name}
                      <span className="badge bg-light text-dark border text-uppercase ms-2">{r.user?.role}</span>
                    </td>
                    <td>{r.user?.department || "-"}</td>
                    <td>{fmtTime(r.checkIn)}</td>
                    <td>{r.checkOut ? fmtTime(r.checkOut) : <span className="text-muted">Still in</span>}</td>
                    <td>{worked(r.checkIn, r.checkOut)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
