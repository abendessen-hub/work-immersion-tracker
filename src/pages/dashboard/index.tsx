import { useNavigate } from "react-router-dom";
import DashboardLayout from "./layout";
import ActionCard from "../../components/action-card";

const actions = [
  {
    title: "Scan QR",
    description: "Record trainee attendance via camera or manual entry",
    tag: "All roles",
    to: "/dashboard/scan-qr",
    active: true,
  },
  {
    title: "Generate QR",
    description: "Generate 4-digit badges and batch print on A4 sheets",
    tag: "Admin",
    to: "/dashboard/generate-qr",
  },
  {
    title: "Attendance",
    description: "View live attendance progress, charts, and records",
    tag: "All roles",
    to: "/dashboard/attendance",
  },
  {
    title: "Create Student Accounts",
    description: "Create accounts for students using Spreadsheets",
    tag: "Teacher",
    to: "/dashboard/create-student-accounts",
  },
  {
    title: "Create Teacher Accounts",
    description: "Create accounts for teachers using this site",
    tag: "Admin",
    to: "/dashboard/create-teacher-accounts",
  },
];

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout
      eyebrow="Dashboard"
      title="Work Immersion Tracker"
      description="Welcome back. <Username> Pick an action below to get started."
      back={false}
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
