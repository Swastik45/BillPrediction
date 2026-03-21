"use client";

import React, { useState } from "react";
import { Mail, Lock, User, AlertCircle, Loader, Eye, EyeOff, X } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export default function Login({ onLoginSuccess, isModal = false, onClose }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!loginUsername || !loginPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("isLoggedIn", "true");
      onLoginSuccess(data);
    } catch (err) {
      setError("Connection error. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!regUsername || !regEmail || !regPassword || !regFullName || !regConfirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          full_name: regFullName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("isLoggedIn", "true");
      onLoginSuccess(data);
    } catch (err) {
      setError("Connection error. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const containerClass = isModal
    ? "login-modal-overlay"
    : "login-page";

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 90% 80%, rgba(201,168,76,0.03) 0%, transparent 50%),
            var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 10, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 60%);
        }

        .login-header {
          padding: 40px 32px 32px;
          border-bottom: 1px solid var(--border);
          text-align: center;
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: 1px solid var(--border);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0;
        }

        .close-btn:hover {
          color: var(--gold);
          border-color: var(--gold);
          background: rgba(201, 168, 76, 0.08);
        }

        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 900;
          color: var(--text-primary);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .login-title span {
          color: var(--gold);
        }

        .login-subtitle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .login-body {
          padding: 32px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--gold-dim);
          pointer-events: none;
          transition: color 0.2s;
        }

        .input-wrapper:focus-within .input-icon {
          color: var(--gold);
        }

        .input-toggle-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 4px 8px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .input-toggle-btn:hover {
          color: var(--gold);
        }

        input[type="text"],
        input[type="email"],
        input[type="password"] {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-bottom: 2px solid var(--border);
          color: var(--text-primary);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          padding: 12px 44px 12px 40px;
          outline: none;
          transition: all 0.2s;
        }

        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="password"]:focus {
          border-color: var(--border-light);
          border-bottom-color: var(--gold);
          background: var(--surface);
        }

        input[type="text"]::placeholder,
        input[type="email"]::placeholder,
        input[type="password"]::placeholder {
          color: var(--text-muted);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          padding: 12px 14px;
          background: rgba(204, 68, 68, 0.06);
          border: 1px solid rgba(204, 68, 68, 0.2);
          border-left: 3px solid var(--red);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: rgba(240, 180, 180, 0.8);
        }

        .error-message svg {
          flex-shrink: 0;
        }

        .submit-btn {
          width: 100%;
          background: var(--gold);
          border: none;
          color: var(--ink);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 14px 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--gold-light);
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .toggle-form {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .toggle-form-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
        }

        .toggle-form-link {
          color: var(--gold);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .toggle-form-link:hover {
          color: var(--gold-light);
        }

        .modal-header-text {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-light);
        }

        .modal-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .modal-subtitle {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 4px;
        }
      `}</style>

      <div className={containerClass}>
        <div className="login-container">
          {isModal && onClose && (
            <button
              type="button"
              className="close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}

          {!isModal && (
            <div className="login-header">
              <div className="login-title">
                Bill<span>Insight</span>
              </div>
              <div className="login-subtitle">
                Energy Intelligence Platform
              </div>
            </div>
          )}

          {isModal && (
            <div className="login-body">
              <div className="modal-header-text">
                <div className="modal-title">{isRegister ? "Create Account" : "Sign In"}</div>
                <div className="modal-subtitle">
                  {isRegister ? "4 predictions limit per day for guests" : "Unlock unlimited predictions"}
                </div>
              </div>
            </div>
          )}

          <div className={isModal ? "" : "login-body"}>
            {error && (
              <div className="error-message">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <form onSubmit={isRegister ? handleRegister : handleLogin}>
              {isRegister && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-wrapper">
                      <User size={14} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrapper">
                      <User size={14} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Choose a username"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={14} className="input-icon" />
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <Lock size={14} className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock size={14} className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {!isRegister && (
                <>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="input-wrapper">
                      <User size={14} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Enter your username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <Lock size={14} className="input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading && <Loader size={14} className="spin" style={{ animation: "spin 1s linear infinite" }} />}
                {isRegister ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="toggle-form">
              <span className="toggle-form-text">
                {isRegister ? "Already have an account? " : "Don't have an account? "}
                <span
                  className="toggle-form-link"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                    setLoginUsername("");
                    setLoginPassword("");
                    setRegUsername("");
                    setRegEmail("");
                    setRegPassword("");
                    setRegFullName("");
                    setRegConfirmPassword("");
                  }}
                >
                  {isRegister ? "Sign In" : "Sign Up"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
