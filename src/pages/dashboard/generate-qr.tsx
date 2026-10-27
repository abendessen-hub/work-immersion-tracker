import DashboardLayout from "./layout";
import Form from "../../components/form";
import SimpleButton from "../../components/simple-button";

function GenerateQrPage() {
  return (
    <DashboardLayout
      eyebrow="Dashboard · Generate QR"
      title="Generate QR"
      description="Admin only. Generate 4-digit badges and batch print on A4 sheets."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Badge batch</h2>
        <p className="dashboard-section-sub">
          Pick a section, choose how many badges to generate, and print them as
          A4 sheets.
        </p>
      </div>
      <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
        <Form
          label="Section"
          id="qr-section"
          placeholder="Section name (e.g., 11 - sample)"
        />
        <Form
          label="Number of badges"
          id="qr-count"
          autoFocus={false}
          type="number"
          placeholder="e.g., 40"
        />
        <SimpleButton type="submit">Generate Badges</SimpleButton>
        <SimpleButton type="button" variant="secondary">
          Print A4 Sheets
        </SimpleButton>
      </form>
    </DashboardLayout>
  );
}

export default GenerateQrPage;