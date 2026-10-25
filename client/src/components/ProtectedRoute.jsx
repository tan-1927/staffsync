import { Navigate } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext";

// Wrap a page in this to guard it.
//   <ProtectedRoute roles={["hr"]}> ... </ProtectedRoute>
// Not logged in  -> sent to /login
// Wrong role     -> sent back to their own dashboard
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePath(user.role)} replace />;
  }
  return children;
}
