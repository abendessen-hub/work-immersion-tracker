import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

type DashboardLayoutProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  back?: boolean;
  children: ReactNode;
};

function DashboardLayout({
  eyebrow = "Dashboard",
  title,
  description,
  back = true,
  children,
}: DashboardLayoutProps) {
  const navigate = useNavigate();

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
          <button
            type="button"
            className="logout-btn"
            onClick={() => navigate("/")}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="dashboard-divider" />

      {children}
    </section>
  );
}

export default DashboardLayout;
