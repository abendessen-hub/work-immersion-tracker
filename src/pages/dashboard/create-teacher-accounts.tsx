import { useState, type FormEvent } from "react";
import DashboardLayout from "./layout";
import Form from "../../components/form";
import SimpleButton from "../../components/simple-button";

function CreateTeacherAccountsPage() {
  const [values, setValues] = useState({
    fullName: "",
    username: "",
    password: "",
    contactNumber: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);

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
      if (!response.ok) throw new Error(result.error ?? "Teacher account could not be created.");
      setValues({ fullName: "", username: "", password: "", contactNumber: "" });
      setIsError(false);
      setMessage(`Teacher account "${result.user.username}" was created.`);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Teacher account could not be created.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Dashboard · Create Account"
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
          onChange={(event) => setValues({ ...values, fullName: event.target.value })}
        />
        <Form
          label="Username"
          id="teacher-username"
          autoFocus={false}
          placeholder="Last 4 of LRN + last name (e.g., 1234cubol)"
          value={values.username}
          onChange={(event) => setValues({ ...values, username: event.target.value })}
        />
        <Form
          label="Password"
          id="teacher-password"
          autoFocus={false}
          type="password"
          autoComplete="new-password"
          placeholder="Temporary password"
          value={values.password}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
        />
        <Form
          label="Contact number"
          id="teacher-contact"
          placeholder="09XX XXX XXXX"
          value={values.contactNumber}
          onChange={(event) => setValues({ ...values, contactNumber: event.target.value })}
        />
        <SimpleButton type="submit" disabled={busy}>
          {busy ? "Creating Account..." : "Create Account"}
        </SimpleButton>
      </form>
      {message ? (
        <p className={isError ? "dashboard-message dashboard-message--error" : "dashboard-message"} role="status">
          {message}
        </p>
      ) : null}
    </DashboardLayout>
  );
}

export default CreateTeacherAccountsPage;