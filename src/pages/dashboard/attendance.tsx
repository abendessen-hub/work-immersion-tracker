import DashboardLayout from "./layout";

const stats = [
  { label: "Present today", value: "38" },
  { label: "On time", value: "31", highlight: "94%", note: " punctuality" },
  { label: "Late arrivals", value: "7" },
  { label: "Total trainees", value: "40" },
];

const recentRecords = [
  { name: "1234cubol", section: "11 - Sample", timeIn: "07:58", timeOut: "17:02" },
  { name: "5678doe", section: "11 - Sample", timeIn: "08:10", timeOut: "17:00" },
  { name: "9012sample", section: "12 - Sample", timeIn: "08:03", timeOut: "—" },
];

function AttendancePage() {
  return (
    <DashboardLayout
      eyebrow="Dashboard · Attendance"
      title="Attendance"
      description="View live attendance progress, charts, and records."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Today</h2>
        <div className="stat-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-tile">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              {stat.highlight ? (
                <span className="stat-delta">
                  <strong>{stat.highlight}</strong>
                  {stat.note}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Immersion hours</h2>
        <div className="attendance-meter">
          <div className="attendance-meter-head">
            <span className="attendance-meter-label">Cohort progress</span>
            <span className="attendance-meter-value">312 / 480 hrs</span>
          </div>
          <div className="attendance-meter-track">
            <div className="attendance-meter-fill" style={{ width: "65%" }} />
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent records</h2>
        <table className="placeholder-table">
          <thead>
            <tr>
              <th scope="col">Trainee</th>
              <th scope="col">Section</th>
              <th scope="col">Time in</th>
              <th scope="col">Time out</th>
            </tr>
          </thead>
          <tbody>
            {recentRecords.map((record) => (
              <tr key={record.name}>
                <td>{record.name}</td>
                <td>{record.section}</td>
                <td>{record.timeIn}</td>
                <td>{record.timeOut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default AttendancePage;