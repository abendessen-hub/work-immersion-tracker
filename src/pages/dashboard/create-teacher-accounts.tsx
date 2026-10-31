import { useState, type FormEvent } from "react";
import DashboardLayout from "./layout";
import Form from "../../components/form";
import SimpleButton from "../../components/simple-button";
type TeacherAccountForm = {
  fullName: string;
  username: string;
  section: string;
  company: string;
  password: string;
  contactNumber: string;
};
function CreateTeacherAccountsPage() {
  const initialValues: TeacherAccountForm = {
    fullName: "",
    username: "",
    section: "",
    company: "",
    password: "",
    contactNumber: "",
  };

  const [values, setValues] = useState<TeacherAccountForm>(initialValues);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  const resetForm = () => setValues(initialValues);
  const handleChange =
    (field: keyof TeacherAccountForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ?? "Teacher account could not be created.",
        );
      resetForm();
      setIsError(false);
      setMessage(`Teacher account "${result.user.username}" was created.`);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Teacher account could not be created.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Create Account"
      title="Create Account"
      description="Admin only. Create accounts for teachers using this site."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">New teacher account</h2>
      </div>
      <form className="dashboard-form" onSubmit={createAccount}>
        <Form
          label="Full name"
          id="teacher-name"
          placeholder="e.g., Juan Dela Cruz"
          value={values.fullName}
          onChange={handleChange("fullName")}
        />
        <Form
          label="Username"
          id="teacher-username"
          autoFocus={false}
          placeholder="Will based on your name (eg, henrich_123)"
          value={values.username}
          onChange={handleChange("username")}
        />
        <Form
          label="Section"
          id="section"
          autoFocus={false}
          placeholder="Section here"
          value={values.section}
          onChange={handleChange("section")}
        />
        <Form
          label="Company"
          id="company"
          autoFocus={false}
          placeholder="Company Here"
          value={values.company}
          onChange={handleChange("company")}
        />
        <Form
          label="Password"
          id="teacher-password"
          autoFocus={false}
          type="password"
          autoComplete="new-password"
          placeholder="Temporary password"
          value={values.password}
          onChange={handleChange("password")}
        />
        <Form
          label="Contact number"
          id="teacher-contact"
          placeholder="09XX XXX XXXX"
          value={values.contactNumber}
          onChange={handleChange("contactNumber")}
        />
        <SimpleButton type="submit" disabled={busy}>
          {busy ? "Creating Account..." : "Create Account"}
        </SimpleButton>
      </form>
      {message ? (
        <p
          className={
            isError
              ? "dashboard-message dashboard-message--error"
              : "dashboard-message"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </DashboardLayout>
  );
}

export default CreateTeacherAccountsPage;
