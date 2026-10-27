import DashboardLayout from "./layout";
import Form from "../../components/form";
import SimpleButton from "../../components/simple-button";

function ScanQrPage() {
  return (
    <DashboardLayout
      eyebrow="Dashboard · Scan QR"
      title="Scan QR"
      description="Record trainee attendance via camera scan or manual entry."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Manual entry</h2>
        <p className="dashboard-section-sub">
          Record attendance for a single trainee by username or LRN-based ID.
        </p>
      </div>
      <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
        <Form
          label="Username"
          id="attendance-username"
          placeholder="Last 4 of LRN + last name (e.g., 1234cubol)"
        />
        <Form
          label="Date"
          id="attendance-date"
          autoFocus={false}
          type="date"
        />
        <Form
          label="Time In"
          id="attendance-time-in"
          autoFocus={false}
          type="time"
        />
        <Form
          label="Time Out"
          id="attendance-time-out"
          autoFocus={false}
          type="time"
          autoComplete="off"
        />
        <SimpleButton type="submit">Record Attendance</SimpleButton>
      </form>
    </DashboardLayout>
  );
}

export default ScanQrPage;