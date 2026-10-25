import { useAuth } from "../context/AuthContext";
import DashboardTiles from "../components/DashboardTiles";

export default function HRDashboard() {
  const { user } = useAuth();
  return (
    <DashboardTiles
      title={`HR Dashboard`}
      subtitle={`Welcome, ${user.name}. You can manage people, leave, attendance and news.`}
      tiles={[
        { title: "Employees", text: "Add, edit and remove employee records." },
        { title: "Leave approvals", text: "Approve or reject leave requests." },
        { title: "Attendance", text: "See attendance for the whole company." },
        { title: "Announcements", text: "Post news and updates for everyone." },
      ]}
    />
  );
}
