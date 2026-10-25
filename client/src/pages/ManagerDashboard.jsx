import { useAuth } from "../context/AuthContext";
import DashboardTiles from "../components/DashboardTiles";

export default function ManagerDashboard() {
  const { user } = useAuth();
  return (
    <DashboardTiles
      title="Manager Dashboard"
      subtitle={`Welcome, ${user.name}. You can handle your team's leave and training.`}
      tiles={[
        { title: "Leave requests", text: "Review and decide on your team's leave." },
        { title: "Training & development", text: "Create training programs and assign them to your team." },
        { title: "Announcements", text: "Read the latest company news." },
      ]}
    />
  );
}
