import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";
import ActionCard from "../../components/action-card";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import BadgeIcon from "@mui/icons-material/Badge";

const actions = [
  {
    title: "Scan QR",
    description: "Record trainee attendance via camera",
    tag: "All roles",
    to: "/dashboard/scan-qr",
    icon: <QrCodeScannerIcon />,
    accessLevels: [1, 2, 3],
    active: true,
  },
  {
    title: "Generate QR",
    description: "Generate a unique QR Code PNGs for companies",
    tag: "Admin",
    accessLevels: [3],
    icon: <QrCode2Icon />,
    to: "/dashboard/generate-qr",
  },
  {
    title: "Attendance",
    description: "View live attendance progress, charts, and records",
    tag: "All roles",
    accessLevels: [1, 2, 3],
    icon: <InsightsIcon />,
    to: "/dashboard/attendance",
  },
  {
    title: "Create Student Accounts",
    description: "Create accounts for students using Spreadsheets",
    tag: "Teacher",
    accessLevels: [2, 3],
    icon: <GroupAddIcon />,
    to: "/dashboard/create-student-accounts",
  },
  {
    title: "Create Teacher Accounts",
    description: "Create accounts for teachers using this site",
    tag: "Admin",
    accessLevels: [3],
    icon: <BadgeIcon />,
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
      description={`Welcome back, ${user?.fullname}. Pick an action below to get started.`}
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
            icon={action.icon}
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
