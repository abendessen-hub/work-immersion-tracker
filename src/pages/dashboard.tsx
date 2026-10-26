import "./dashboard.css";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <section className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1 className="dashboard-title">Work Immersion Tracker</h1>
        </div>
        <button
          type="button"
          className="logout-btn"
          onClick={() => navigate("/")}
        >
          Log Out
        </button>
      </div>

      <div className="dashboard-divider" />

      <div className="dashboard-welcome">
        <h2>Welcome back</h2>
      </div>

      <div className="dashboard-actions">
        <button type="button" className="action-card active">
          <h3 className="action-title">Scan QR</h3>
          <p className="action-desc">
            Record trainee attendance via camera or manual entry
          </p>
        </button>

        <button type="button" className="action-card">
          <h3 className="action-title">Generate QR</h3>
          <p className="action-desc">
            Generate 4-digit badges and batch print on A4 sheets
          </p>
        </button>

        <button type="button" className="action-card">
          <h3 className="action-title">Progress</h3>
          <p className="action-desc">
            View live attendance progress, charts, and qualifications history
          </p>
        </button>
      </div>
    </section>
  );
}

export default DashboardPage;
