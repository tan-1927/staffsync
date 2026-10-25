import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

// A "context" is a box of data (who is logged in) that every page can read.
const AuthContext = createContext(null);

// Which dashboard belongs to which role
export const homePath = (role) =>
  ({ hr: "/hr", manager: "/manager", employee: "/employee" }[role] || "/login");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the page loads: if a token is saved, ask the server who it belongs to.
  // This keeps you logged in after a refresh.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token")) // expired or fake token
      .finally(() => setLoading(false));
  }, []);

  // Save the wristband in the browser and remember the user
  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return saveSession(res.data);
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    return saveSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
