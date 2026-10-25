import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homePath(user.role)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const created = await register(name, email, password);
      navigate(homePath(created.role));
    } catch (err) {
      setError(err.response?.data?.msg || "Cannot reach the server");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 420 }}>
      <h1 className="fw-bold text-center">StaffSync</h1>
      <p className="text-muted text-center mb-4">
        Create an employee account
      </p>

      <form onSubmit={handleSubmit} className="card card-body shadow-sm">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <label className="form-label">Full name</label>
        <input
          className="form-control mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="form-label">Password (min 6 characters)</label>
        <input
          type="password"
          className="form-control mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button className="btn btn-dark w-100" disabled={busy}>
          {busy ? "Creating..." : "Sign up"}
        </button>
      </form>

      <p className="text-center mt-4 mb-0">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
