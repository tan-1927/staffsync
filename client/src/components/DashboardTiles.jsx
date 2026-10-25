// Shared layout for the three dashboards.
// The tiles are placeholders now; each one becomes a real page in the next steps.
export default function DashboardTiles({ title, subtitle, tiles }) {
  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-1">{title}</h2>
      <p className="text-muted mb-4">{subtitle}</p>
      <div className="row g-3">
        {tiles.map((t) => (
          <div className="col-12 col-md-6" key={t.title}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{t.title}</h5>
                <p className="card-text text-muted">{t.text}</p>
                <span className="badge bg-secondary">Coming soon</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
