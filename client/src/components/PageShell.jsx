import { Link } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext";

// Common page frame: back link, title, and success/error messages.
export default function PageShell({ title, subtitle, error, success, children }) {
  const { user } = useAuth();
  return (
    <div className="container py-4">
      <Link to={homePath(user.role)} className="text-decoration-none">
        &larr; Dashboard
      </Link>
      <h2 className="fw-bold mt-2 mb-1">{title}</h2>
      {subtitle && <p className="text-muted">{subtitle}</p>}
      {error && <div className="alert alert-danger py-2">{error}</div>}
      {success && <div className="alert alert-success py-2">{success}</div>}
      {children}
    </div>
  );
}
