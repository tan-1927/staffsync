import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext";

// Click-to-fill buttons so a reviewer can try every role in seconds
const DEMO_PASSWORD = "Password@123";
const demos = [
  { label: "HR", email: "hr@staffsync.com" },
  { label: "Manager", email: "manager@staffsync.com" },
  { label: "Employee", email: "employee1@staffsync.com" },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // already logged in? go straight to your dashboard
  if (user) return <Navigate to={homePath(user.role)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const loggedIn = await login(email, password);
      navigate(homePath(loggedIn.role));
    } catch (err) {
      setError(err.response?.data?.msg || "Cannot reach the server");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="fw-bold text-center">StaffSync</h1>
      <p className="text-muted text-center mb-4">Sign in to continue</p>

      <form onSubmit={handleSubmit} className="card card-body shadow-sm">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-dark w-100" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-3 text-center">
        <small className="text-muted d-block mb-2">Demo accounts (click to fill)</small>
        <div className="d-flex justify-content-center gap-2">
          {demos.map((d) => (
            <button
              type="button"
              key={d.label}
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setEmail(d.email);
                setPassword(DEMO_PASSWORD);
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center mt-4 mb-0">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}
