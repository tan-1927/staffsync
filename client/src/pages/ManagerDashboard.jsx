import { useAuth } from "../context/AuthContext";
import DashboardTiles from "../components/DashboardTiles";

export default function ManagerDashboard() {
  const { user } = useAuth();
  return (
    <DashboardTiles
      title="Manager Dashboard"
      subtitle={`Welcome, ${user.name}. You can handle your team's leave and training.`}
      tiles={[
        { title: "Leave requests", text: "Review and decide on your team's leave.", to: "/leave-requests" },
        { title: "Training & development", text: "Create training programs and assign them to your team.", to: "/trainings" },
        { title: "My leave", text: "Apply for your own leave (HR approves it).", to: "/leaves" },
        { title: "My attendance", text: "Check in and check out for the day.", to: "/attendance" },
        { title: "Announcements", text: "Read the latest company news.", to: "/announcements" },
        { title: "My profile", text: "View and update your details.", to: "/profile" },
      ]}
    />
  );
}
