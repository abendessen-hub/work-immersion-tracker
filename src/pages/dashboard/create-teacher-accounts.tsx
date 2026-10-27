import DashboardLayout from "./layout";
import Form from "../../components/form";
import SimpleButton from "../../components/simple-button";

function CreateTeacherAccountsPage() {
  return (
    <DashboardLayout
      eyebrow="Dashboard · Create Account"
      title="Create Account"
      description="Admin only. Create accounts for teachers using this site."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">New teacher account</h2>
      </div>
      <form className="dashboard-form" onSubmit={(event) => event.preventDefault()}>
        <Form label="Full name" id="teacher-name" placeholder="e.g., Juan Dela Cruz" />
        <Form
          label="Username"
          id="teacher-username"
          autoFocus={false}
          placeholder="Last 4 of LRN + last name (e.g., 1234cubol)"
        />
        <Form
          label="Password"
          id="teacher-password"
          autoFocus={false}
          type="password"
          autoComplete="new-password"
          placeholder="Temporary password"
        />
        <Form label="Contact number" id="teacher-contact" placeholder="09XX XXX XXXX" />
        <SimpleButton type="submit">Create Account</SimpleButton>
      </form>
    </DashboardLayout>
  );
}

export default CreateTeacherAccountsPage;