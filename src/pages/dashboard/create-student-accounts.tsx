import DashboardLayout from "./layout";
import SimpleButton from "../../components/simple-button";

function CreateStudentAccountsPage() {
  return (
    <DashboardLayout
      eyebrow="Dashboard · Create Accounts"
      title="Create Accounts"
      description="Teacher only. Create accounts for students using Spreadsheets."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Import from spreadsheet</h2>
        <p className="dashboard-section-sub">
          Upload a CSV of students (username, section, company, contact number)
          and accounts are created in bulk.
        </p>
      </div>
      <div className="dashboard-section">
        <SimpleButton type="button">Upload Spreadsheet</SimpleButton>
        <SimpleButton type="button" variant="secondary">
          Download Template
        </SimpleButton>
      </div>
    </DashboardLayout>
  );
}

export default CreateStudentAccountsPage;