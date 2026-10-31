import { useAuth } from "../../context/useAuth";
import DashboardLayout from "./layout";

//const allowedAccess = { admin: 3 };

function ManageReferences() {
  const { user } = useAuth();
  //const isAdmin = user?.accessId === allowedAccess.admin;

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Manage References"
      title="Manage References"
      description="Admin only. Manage company check-in locations and access references."
    >
      <h1>W.I.P</h1>
    </DashboardLayout>
  );
}

export default ManageReferences;
