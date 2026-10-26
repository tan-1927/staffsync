import { useEffect, useState } from "react";
import api from "../api/axios";
import PageShell from "../components/PageShell";
import { fmtDate, errMsg } from "../utils/format";

const statusColor = { scheduled: "bg-primary", completed: "bg-success", cancelled: "bg-secondary" };

// Everyone: trainings assigned to me
export default function MyTrainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/trainings/me")
      .then((res) => setTrainings(res.data.trainings))
      .catch((err) => setError(errMsg(err, "Could not load trainings")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="My trainings" subtitle="Programs assigned to you." error={error}>
      {loading ? (
        <div className="spinner-border" role="status" />
      ) : trainings.length === 0 ? (
        <p className="text-muted">Nothing is assigned to you right now.</p>
      ) : (
        trainings.map((t) => (
          <div className="card shadow-sm mb-3" key={t._id}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <h5 className="card-title">{t.title}</h5>
                <span className={`badge ${statusColor[t.status]} text-capitalize`}>{t.status}</span>
              </div>
              {t.description && <p className="card-text">{t.description}</p>}
              <small className="text-muted">
                {fmtDate(t.date)} · Organised by {t.createdBy?.name}
              </small>
            </div>
          </div>
        ))
      )}
    </PageShell>
  );
}
