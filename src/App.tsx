import "./App.css";
import { useState, type FormEvent, type MouseEvent } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import SimpleButton from "./components/simple-button";
import DashboardPage from "./pages/dashboard";
import ScanQrPage from "./pages/dashboard/scan-qr";
import GenerateQrPage from "./pages/dashboard/generate-qr";
import AttendancePage from "./pages/dashboard/attendance";
import CreateStudentAccountsPage from "./pages/dashboard/create-student-accounts";
import CreateTeacherAccountsPage from "./pages/dashboard/create-teacher-accounts";
import Form from "./components/form";
import ModalBackdrop from "./components/modal-backdrop";

import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import CompanyLogo from "./assets/company_logo.jpg";
import SchoolLogo from "./assets/school_logo.jpg";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading } = useAuth();
  const [values, setValues] = useState({
    username: "",
    password: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    changePassModalOpen: false,

    signingIn: false,
    changingPassword: false,
  });
  const [errors, setErrors] = useState<{
    signIn?: string;
    changePassword?: string;
  }>({
    signIn: (() =>
      (location.state as { error?: string } | null)?.error ?? "")(),
    changePassword: "",
  });
  const [showPassword, setShowpassword] = useState({
    password: false,
    currentPassword: false,
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
        Loading session...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ ...errors, signIn: "" });
    setValues({
      ...values,
      signingIn: true,
    });
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ ...errors, signIn: data.error || "Login failed" });
        setValues({
          ...values,
          signingIn: false,
        });
        return;
      }

      // Update global auth state and redirect to dashboard
      login(data);
      setValues({
        ...values,
        signingIn: false,
      });
      if (data.changedPassword) {
        navigate("/dashboard");
      } else {
        setValues({ ...values, changePassModalOpen: true });
      }
    } catch (err) {
      console.error("Network error at /api/login:", err);
      setErrors({ ...errors, signIn: "An unexpected network error occurred." });
    }
  };

  async function handleChangePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValues({
      ...values,
      changingPassword: false,
    });
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setValues({
          ...values,
          changingPassword: false,
        });
        //wip: add some error message bullshit similar to login idfk im gonna go to sleep
        return;
      }

      setValues({ ...values, changePassModalOpen: false });
      navigate("/dashboard");
    } catch (err) {
      console.error("Network error at /api/login:", err);
    }
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
            {values.signingIn ? "Signing In..." : "Sign In"}
          </SimpleButton>

          {errors.signIn && (
            <div
              style={{
                color: "#ff4d4f",
                marginBottom: "1px",
                fontSize: "14px",
              }}
            >
              {errors.signIn}
            </div>
          )}
        </form>

        <ModalBackdrop hidden={!values.changePassModalOpen}>
          <form className="login-form" onSubmit={handleChangePasswordSubmit}>
            <Form
              label="Current Password"
              id="currentPassword"
              type={showPassword.currentPassword ? "text" : "password"}
              autoComplete="currentPassword"
              placeholder="Current Password"
              onChange={(event) => {
                setValues({ ...values, currentPassword: event.target.value });
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    name="currentPassword"
                    type="button"
                    aria-label={
                      showPassword.currentPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword.currentPassword}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword.currentPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
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

// --- Main App Component Wrapped with AuthProvider ---
function AppContent() {
  return (
    <main className="page-background">
      <div className="rail" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/scan-qr"
          element={
            <ProtectedRoute>
              <ScanQrPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/generate-qr"
          element={
            <ProtectedRoute>
              <GenerateQrPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-student-accounts"
          element={
            <ProtectedRoute>
              <CreateStudentAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create-teacher-accounts"
          element={
            <ProtectedRoute>
              <CreateTeacherAccountsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
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
        <div className="footer-credit-details">
          <p className="footer-credit">
            <span>Powered by</span>
            <strong>Nexus</strong>
          </p>

          <p className="footer-credit">
            <span>Collaborated with</span>
            <strong>XDO</strong>
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
