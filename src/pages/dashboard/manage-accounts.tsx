import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";

//const allowedAccess = { admin: 3 };

function ManageAccounts() {
  const { user } = useAuth();
  //const isAdmin = user?.accessId === allowedAccess.admin;

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Manage Accounts"
      title="Manage Accounts"
      description="Admin only. Manage accounts here."
    >
      <h1>W.I.P</h1>
    </DashboardLayout>
  );
}

export default ManageAccounts;
