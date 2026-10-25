import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth, homePath } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const filters = ["pending", "approved", "rejected", "all"];

// HR and managers: see leave requests and approve or reject them
export default function LeaveRequests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("pending");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async (which = filter) => {
    setLoading(true);
    try {
      const res = await api.get("/leaves", {
        params: which === "all" ? {} : { status: which },
      });
      setLeaves(res.data.leaves);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const decide = async (leave, status) => {
    let note = "";
    if (status === "rejected") {
      note = window.prompt("Reason for rejecting (optional)");
      if (note === null) return; // pressed Cancel
    }
    setError("");
    setSuccess("");
    try {
      await api.patch(`/leaves/${leave.id}`, { status, note });
      setSuccess(`Request ${status}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not update the request");
    }
  };

  return (
    <div className="container py-4">
      <Link to={homePath(user.role)} className="text-decoration-none">
        &larr; Dashboard
      </Link>
      <h2 className="fw-bold mt-2 mb-1">Leave requests</h2>
      <p className="text-muted">
        {user.role === "hr"
          ? "You can decide leave for managers and employees."
          : "You can decide leave for employees."}
      </p>

      <div className="btn-group mb-3" role="group">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={`btn btn-sm text-capitalize ${filter === f ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}

      {loading ? (
        <div className="spinner-border" role="status" />
      ) : leaves.length === 0 ? (
        <p className="text-muted">Nothing here.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Person</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    {l.user?.name}
                    <span className="badge bg-light text-dark border text-uppercase ms-2">
                      {l.user?.role}
                    </span>
                    <div className="text-muted small">{l.user?.email}</div>
                  </td>
                  <td className="text-capitalize">{l.type}</td>
                  <td>{fmt(l.fromDate)}</td>
                  <td>{fmt(l.toDate)}</td>
                  <td>{l.days}</td>
                  <td style={{ maxWidth: 220 }}>{l.reason}</td>
                  <td>
                    <StatusBadge status={l.status} />
                    {l.reviewNote && <div className="text-muted small">{l.reviewNote}</div>}
                  </td>
                  <td className="text-nowrap">
                    {l.status === "pending" && (
                      <>
                        <button className="btn btn-success btn-sm me-2" onClick={() => decide(l, "approved")}>
                          Approve
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => decide(l, "rejected")}>
                          Reject
                        </button>
                      </>
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
