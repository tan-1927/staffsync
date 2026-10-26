import { useAuth } from "../context/AuthContext";
import DashboardTiles from "../components/DashboardTiles";

export default function HRDashboard() {
  const { user } = useAuth();
  return (
    <DashboardTiles
      title="HR Dashboard"
      subtitle={`Welcome, ${user.name}. You can manage people, leave, attendance and news.`}
      tiles={[
        { title: "Employees", text: "Add, edit and remove employee records.", to: "/employees" },
        { title: "Leave approvals", text: "Approve or reject leave requests.", to: "/leave-requests" },
        { title: "Company attendance", text: "See who was present on any day.", to: "/attendance-all" },
        { title: "Announcements", text: "Post news and updates for everyone.", to: "/announcements" },
        { title: "Training programs", text: "See all training programs.", to: "/trainings" },
        { title: "My attendance", text: "Check in and out for yourself.", to: "/attendance" },
        { title: "My profile", text: "View and update your details.", to: "/profile" },
      ]}
    />
  );
}
