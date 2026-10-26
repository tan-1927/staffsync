import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth, homePath } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HRDashboard from "./pages/HRDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Leaves from "./pages/Leaves";
import LeaveRequests from "./pages/LeaveRequests";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import AttendanceAll from "./pages/AttendanceAll";
import Announcements from "./pages/Announcements";
import Trainings from "./pages/Trainings";
import MyTrainings from "./pages/MyTrainings";
import Profile from "./pages/Profile";

// "/" sends you to your dashboard if logged in, otherwise to the login page
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homePath(user.role) : "/login"} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/hr"
          element={
            <ProtectedRoute roles={["hr"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute roles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute roles={["employee", "manager"]}>
              <Leaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-requests"
          element={
            <ProtectedRoute roles={["hr", "manager"]}>
              <LeaveRequests />
            </ProtectedRoute>
          }
        />

        <Route path="/employees" element={<ProtectedRoute roles={["hr"]}><Employees /></ProtectedRoute>} />
        <Route path="/attendance-all" element={<ProtectedRoute roles={["hr"]}><AttendanceAll /></ProtectedRoute>} />
        <Route path="/trainings" element={<ProtectedRoute roles={["hr", "manager"]}><Trainings /></ProtectedRoute>} />
        <Route path="/my-trainings" element={<ProtectedRoute roles={["employee"]}><MyTrainings /></ProtectedRoute>} />
        {/* any logged-in role */}
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
