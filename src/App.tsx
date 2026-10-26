import "./App.css";
import { useState, type FormEvent, type MouseEvent } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SimpleButton from "./components/simple-button";
import DashboardPage from "./pages/dashboard";
import Form from "./components/form";
import ModalBackdrop from "./components/modal-backdrop";

import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
declare module "*.jpg";
declare module "*.png";
declare module "*.svg";

import CompanyLogo from "./assets/company_logo.jpg";
import SchoolLogo from "./assets/school_logo.jpg";

function LoginPage() {
  const [values, setValues] = useState({
    username: "",
    password: "",
    newPassword: "",
    confirmPassword: "",

    changePassModalOpen: false,
  });
  const [showPassword, setShowpassword] = useState({
    password: false,
    newPassword: false,
    confirmPassword: false,
  });
  const handleClickShowPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    const clickedName = e.currentTarget.name as keyof typeof showPassword;
    setShowpassword({
      ...showPassword,
      [clickedName]: !showPassword[clickedName],
    });
  };
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValues({ ...values, changePassModalOpen: true });
    // navigate('/dashboard')
  }

  function handleChangePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setValues({ ...values, changePassModalOpen: false });
  }

  return (
    <div className="login-layout">
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">Work Immersion Tracker: W.I.T</p>
        <h1 id="login-title">Sign in</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <Form
            label="Username"
            id="username"
            autoComplete="username"
            placeholder="Last 4 of LRN + last name (e.g., 1234cubol)"
            onChange={(event) => {
              setValues({ ...values, username: event.target.value });
            }}
          />

          <Form
            label="Password"
            type={showPassword.password ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            placeholder="Enter Password"
            onChange={(event) => {
              setValues({ ...values, password: event.target.value });
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  name="password"
                  type="button"
                  aria-label={
                    showPassword.password ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword.password}
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword.password ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
          <SimpleButton type="submit" size="medium">
            Sign In
          </SimpleButton>
        </form>
        <ModalBackdrop hidden={!values.changePassModalOpen}>
          <form className="login-form" onSubmit={handleChangePasswordSubmit}>
            <Form
              label="New Password"
              id="newPassword"
              type={showPassword.newPassword ? "text" : "password"}
              autoComplete="newPassword"
              placeholder="New Password"
              onChange={(event) => {
                setValues({ ...values, newPassword: event.target.value });
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    name="newPassword"
                    type="button"
                    aria-label={
                      showPassword.newPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword.newPassword}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword.newPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <Form
              label="Confirm New Password"
              id="confirmPassword"
              type={showPassword.confirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm New Password"
              onChange={(event) => {
                setValues({ ...values, confirmPassword: event.target.value });
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    name="confirmPassword"
                    type="button"
                    aria-label={
                      showPassword.confirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword.confirmPassword}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword.confirmPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
            <SimpleButton size="medium" type="submit" fullWidth>
              Change Password
            </SimpleButton>
          </form>
        </ModalBackdrop>
        <p className="login-help">Enter your assigned username and password.</p>
      </section>
    </div>
  );
}

function App() {
  return (
    <main className="page-background">
      <div className="rail" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="site-footer">
        <div className="footer-brand">
          <img
            className="footer-brand-logo"
            src={CompanyLogo}
            alt="JDVP brand logo"
          />
          <div className="footer-school">
            <img
              className="footer-school-logo"
              src={SchoolLogo}
              role="img"
              aria-label="School logo placeholder"
            />
            <div className="footer-school-details">
              <span className="footer-school-label">School partner</span>
              <span className="footer-school-name">
                Luis Y. Ferror Jr. Senior High School
              </span>
            </div>
          </div>
        </div>
        <div>
          <p className="footer-credit">
            <span>Powered by</span>
            <strong>Nexus</strong>
          </p>

          <p className="footer-credit">
            <span>Collaborated with</span>
            <strong>N/A</strong>
          </p>
        </div>
      </footer>
    </main>
  );
}

export default App;
