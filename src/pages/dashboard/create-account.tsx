import { useEffect, useState, type FormEvent } from "react";
import DashboardLayout from "./layout";
import Form from "../../components/form";
import SimpleButton from "../../components/simple-button";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type AccountForm = {
  fullName: string;
  username: string;
  section: string;
  company: string;
  password: string;
  changedPassword: string;
  contactNumber: string;
  accessId: string;
};

type References = {
  sections: { section_id: number; section_name: string }[];
  companies: { company_id: number; company_name: string }[];
  accessReferences: { access_id: number; access_name: string }[];
};

export default function CreateAccountPage() {
  const initialValues: AccountForm = {
    fullName: "",
    username: "",
    section: "",
    company: "",
    password: "",
    changedPassword: "",
    contactNumber: "",
    accessId: "",
  };

  const [values, setValues] = useState<AccountForm>(initialValues);
  const [references, setReferences] = useState<References>({
    sections: [],
    companies: [],
    accessReferences: [],
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const selectedAccess = references.accessReferences.find(
    (access) => String(access.access_id) === values.accessId,
  );
  const isAdminOrDeployer = ["admin", "deployer"].includes(
    selectedAccess?.access_name.toLowerCase() ?? "",
  );

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
  };

  useEffect(() => {
    fetch("/api/reference-data")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error ?? "Reference data could not be loaded.",
          );
        setReferences(result as References);
      })
      .catch((error: unknown) => {
        setIsError(true);
        setMessage(
          error instanceof Error
            ? error.message
            : "Reference data could not be loaded.",
        );
      });
  }, []);

  const resetForm = () => setValues(initialValues);
  const handleChange =
    (field: keyof AccountForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const createAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          accessId: Number(values.accessId),
          changedPassword: values.changedPassword === "true",
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Account could not be created.");
      resetForm();
      setIsError(false);
      setMessage(`Account "${result.user.username}" was created.`);
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Account could not be created.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout
      eyebrow="Work Immersion Monitoring System (WIMS) · Create Account"
      title="Create Account"
      description="Admin only. Create an account and choose its access reference."
    >
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">New account</h2>
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
          placeholder="Enter a unique username (e.g., henrich_123)"
          value={values.username}
          onChange={handleChange("username")}
        />
        <label className="form-field" htmlFor="account-section">
          Section{isAdminOrDeployer ? " (optional)" : ""}
          <select
            id="account-section"
            value={values.section}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, section: event.target.value }))
            }
            required={!isAdminOrDeployer}
          >
            <option value="">Select section</option>
            {references.sections.map((section) => (
              <option key={section.section_id} value={section.section_name}>
                {section.section_name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field" htmlFor="account-company">
          Company{isAdminOrDeployer ? " (optional)" : ""}
          <select
            id="account-company"
            value={values.company}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, company: event.target.value }))
            }
            required={!isAdminOrDeployer}
          >
            <option value="">Select company</option>
            {references.companies.map((company) => (
              <option key={company.company_id} value={company.company_name}>
                {company.company_name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field" htmlFor="account-access-reference">
          Access reference
          <select
            id="account-access-reference"
            value={values.accessId}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, accessId: event.target.value }))
            }
            required
          >
            <option value="">Select access</option>
            {references.accessReferences.map((access) => (
              <option key={access.access_id} value={access.access_id}>
                {access.access_name}
              </option>
            ))}
          </select>
        </label>
        <Form
          label="Password"
          id="teacher-password"
          autoFocus={false}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Temporary password"
          value={values.password}
          onChange={handleChange("password")}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                name="password"
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
        <label className="form-field" htmlFor="account-changed-password">
          Changed Password
          <select
            id="account-changed-password"
            value={values.changedPassword}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                changedPassword: event.target.value,
              }))
            }
            required
          >
            <option value="">Select status</option>
            <option key={"Yes"} value={"true"}>
              Yes
            </option>

            <option key={"No"} value={"false"}>
              No
            </option>
          </select>
        </label>
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
