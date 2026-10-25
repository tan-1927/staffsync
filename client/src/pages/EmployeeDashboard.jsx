import { useAuth } from "../context/AuthContext";
import DashboardTiles from "../components/DashboardTiles";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  return (
    <DashboardTiles
      title="Employee Dashboard"
      subtitle={`Welcome, ${user.name}. Apply for leave, mark attendance and stay updated.`}
      tiles={[
        { title: "Apply for leave", text: "Send a leave request and track its status." },
        { title: "Mark attendance", text: "Check in and check out for the day." },
        { title: "My profile", text: "View and update your personal records." },
        { title: "Announcements", text: "Read the latest company news." },
        { title: "My trainings", text: "See training programs assigned to you." },
      ]}
    />
  );
}
