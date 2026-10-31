import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./dashboard.css";

type DashboardLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  back?: boolean;
  logout?: boolean;
  children: ReactNode;
};

const roleLabelById: Record<number, string> = {
  1: "Student",
  2: "Teacher",
  3: "Admin",
};

function DashboardLayout({
  eyebrow = "Work Immersion Monitoring System (WIMS)",
  title,
  description,
  back = true,
  logout = false,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout: callLogout } = useAuth();
  const [logoutMessage, setLogoutMessage] = useState("Log Out");
  const handleLogout = () => {
    setLogoutMessage("Logging out...");
    callLogout().finally(() => {
      setLogoutMessage("Log Out.");
      navigate("/");
    });
  };
  const roleLabel = user ? (roleLabelById[user.accessId] ?? "Member") : null;

  return (
    <section className="dashboard-card">
      <div className="dashboard-header">
        <div className="dashboard-header-copy">
          <div className="dashboard-eyebrow-row">
            <span className="eyebrow-pill">
              <span className="eyebrow-dot" aria-hidden="true" />
              {eyebrow}
            </span>
            {roleLabel ? (
              <span className="role-pill">{roleLabel} Portal</span>
            ) : null}
          </div>
          <h1 className="dashboard-title">{title}</h1>
          {description ? (
            <p className="dashboard-description">{description}</p>
          ) : null}
        </div>
        <div className="dashboard-header-actions">
          {back ? (
            <button
              type="button"
              className="logout-btn logout-btn--ghost"
              onClick={() => navigate("/dashboard")}
            >
              ← Back
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
