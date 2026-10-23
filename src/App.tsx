import './App.css'
import type { FormEvent } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import SimpleButton from './components/simple-button'
import DashboardPage from './pages/dashboard'

function LoginPage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/dashboard')
  }

  return (
      <section className="login-card" aria-labelledby="login-title">
        <p className="eyebrow">Work Immersion Tracker: W.I.T</p>
        <h1 id="login-title">Sign in</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input
              autoComplete="username"
              autoFocus
              id="username"
              name="username"
              placeholder="Last 4 of LRN + last name (e.g., 1234cubol)"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
            />
          </div>
          <SimpleButton type="submit" size="medium">Sign In</SimpleButton>
        </form>

        <p className="login-help">
          Enter your assigned username and password.
        </p>
      </section>
  )
}

function App() {
  return (
    <main className="login-page page-background">
      <div className="rail" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App
