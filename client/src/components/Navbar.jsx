import { Link, useNavigate } from "react-router-dom";
import { useAuth, homePath } from "../context/AuthContext";

const badgeColor = {
  hr: "bg-danger",
  manager: "bg-warning text-dark",
  employee: "bg-success",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // no navbar on the login page

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <Link className="navbar-brand fw-bold" to={homePath(user.role)}>
        StaffSync
      </Link>
      <div className="d-flex align-items-center gap-3">
        <span className="text-light">
          {user.name}
          <span className={`badge ${badgeColor[user.role]} text-uppercase ms-2`}>
            {user.role}
          </span>
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
