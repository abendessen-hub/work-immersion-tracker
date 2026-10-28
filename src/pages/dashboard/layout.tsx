import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./dashboard.css";

type DashboardLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  back?: boolean;
  logout?: boolean;
  children: ReactNode;
};

function DashboardLayout({
  eyebrow = "Dashboard",
  title,
  description,
  back = true,
  logout = false,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { logout: callLogout } = useAuth();
  const [logoutMessage, setLogoutMessage] = useState("Log Out");
  const handleLogout = () => {
    setLogoutMessage("Logging out...");
    callLogout().finally(() => {
      setLogoutMessage("Log Out.");
      navigate("/");
    });
  };
  return (
    <section className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="dashboard-title">{title}</h1>
          {description ? (
            <p className="dashboard-description">{description}</p>
          ) : null}
        </div>
        <div className="dashboard-header-actions">
          {back ? (
            <button
              type="button"
              className="logout-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back
            </button>
          ) : null}
          {logout ? (
            <button type="button" className="logout-btn" onClick={handleLogout}>
              {logoutMessage}
            </button>
          ) : null}
        </div>
      </div>

      <div className="dashboard-divider" />

      {children}
    </section>
  );
}

export default DashboardLayout;
