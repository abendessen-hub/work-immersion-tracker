import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "./layout";
import ActionCard from "../../components/action-card";

const actions = [
  {
    title: "Scan QR",
    description: "Record trainee attendance via camera",
    tag: "All roles",
    to: "/dashboard/scan-qr",
    accessLevel: 1,
    active: true,
  },
  {
    title: "Generate QR",
    description: "Generate 4-digit badges and batch print on A4 sheets",
    tag: "Admin",
    accessLevel: 3,
    to: "/dashboard/generate-qr",
  },
  {
    title: "Attendance",
    description: "View live attendance progress, charts, and records",
    tag: "All roles",
    accessLevel: 1,
    to: "/dashboard/attendance",
  },
  {
    title: "Create Student Accounts",
    description: "Create accounts for students using Spreadsheets",
    tag: "Teacher",
    accessLevel: 2,
    to: "/dashboard/create-student-accounts",
  },
  {
    title: "Create Teacher Accounts",
    description: "Create accounts for teachers using this site",
    tag: "Admin",
    accessLevel: 3,
    to: "/dashboard/create-teacher-accounts",
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <DashboardLayout
      eyebrow="Dashboard"
      title="Work Immersion Tracker"
      //wip: might add actual name of user to neon database
      description={`Welcome back. ${user?.username} Pick an action below to get started.`}
      back={false}
      logout={true}
    >
      <div className="dashboard-actions">
        {actions.map((action) => (
          <ActionCard
            key={action.to}
            title={action.title}
            description={action.description}
            tag={action.tag}
            active={action.active}
            onClick={() => navigate(action.to)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
