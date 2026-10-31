import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";
import ActionCard from "../../components/action-card";

const actions = [
  {
    title: "Scan QR",
    description: "Record trainee attendance via camera",
    tag: "All roles",
    to: "/dashboard/scan-qr",
    accessLevels: [1, 2, 3],
    active: true,
  },
  {
    title: "Generate QR",
    description: "Generate a unique QR Code PNGs for companies",
    tag: "Admin",
    accessLevels: [3],
    to: "/dashboard/generate-qr",
  },
  {
    title: "Attendance",
    description: "View live attendance progress, charts, and records",
    tag: "All roles",
    accessLevels: [1, 2, 3],
    to: "/dashboard/attendance",
  },
  {
    title: "Create Student Accounts",
    description: "Create accounts for students using Spreadsheets",
    tag: "Teacher",
    accessLevels: [2, 3],
    to: "/dashboard/create-student-accounts",
  },
  {
    title: "Create Teacher Accounts",
    description: "Create accounts for teachers using this site",
    tag: "Admin",
    accessLevels: [3],
    to: "/dashboard/create-teacher-accounts",
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <DashboardLayout
      eyebrow="Dashboard"
      title="Work Immersion Monitoring System (WIMS)"
      description={`Welcome back. ${user?.fullname} Pick an action below to get started.`}
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
            accessLevels={action.accessLevels}
            onClick={() => navigate(action.to)}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
