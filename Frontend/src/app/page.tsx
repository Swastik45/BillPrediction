"use client";

import { useState, useEffect } from "react";
import { Zap, Activity, History, AlertCircle, Trash2, BarChart3, Calculator, TrendingDown } from "lucide-react";
import PredictionForm from "@/components/PredictionForm";
import PredictionResult from "@/components/PredictionResult";
import HistoryList from "@/components/HistoryList";
import Login from "@/components/Login";
import UserDashboard from "@/components/UserDasboard";

interface HistoryItem {
  id: number;
  units: number;
  predicted_bill: number;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
}

export default function BillApp() {
  const [units, setUnits] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [guestPredictionCount, setGuestPredictionCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      const isLoggedInStored = localStorage.getItem("isLoggedIn");

      if (storedUser && isLoggedInStored === "true") {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        // Load guest prediction count
        const today = new Date().toDateString();
        const guestData = localStorage.getItem("guestPredictions");
        if (guestData) {
          const { date, count } = JSON.parse(guestData);
          if (date === today) {
            setGuestPredictionCount(count);
          } else {
            // Reset count for new day
            localStorage.setItem("guestPredictions", JSON.stringify({ date: today, count: 0 }));
            setGuestPredictionCount(0);
          }
        } else {
          localStorage.setItem("guestPredictions", JSON.stringify({ date: today, count: 0 }));
        }
      }
      setAppLoading(false);
    };

    checkAuth();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setError(null);
    try {
      const url = isLoggedIn
        ? `http://localhost:5000/api/history?user_id=${user?.id}`
        : "http://localhost:5000/api/history";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError("Unable to connect to server. Please ensure the backend is running.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!appLoading) {
      fetchHistory();
    }
  }, [isLoggedIn, user, appLoading]);

  const deleteHistoryItem = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/history/${id}`, { method: "DELETE" });
      if (res.ok) setHistory(history.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Clear all prediction history? This cannot be undone.")) return;
    try {
      const url = isLoggedIn
        ? `http://localhost:5000/api/history/clear?user_id=${user?.id}`
        : "http://localhost:5000/api/history/clear";
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
        await fetchHistory();
      } else {
        setError("Failed to clear history. Please try again.");
      }
    } catch (err) {
      setError("Failed to clear history. Please ensure the backend is running.");
    }
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setHistory([]);
    setShowLoginModal(false);
  };

  const validateInput = (): boolean => {
    const numUnits = parseFloat(units);
    if (isNaN(numUnits) || numUnits <= 0) { setInputError("Please enter a valid positive number"); return false; }
    if (numUnits > 10000) { setInputError("Value seems too high. Please check your input."); return false; }
    setInputError("");
    return true;
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check guest prediction limit
    if (!isLoggedIn) {
      if (guestPredictionCount >= 4) {
        setShowLoginModal(true);
        return;
      }
    }

    if (!validateInput()) return;
    setLoading(true);
    setError(null);
    setShowResult(false);
    try {
      const res = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          units: parseFloat(units),
          user_id: isLoggedIn ? user?.id : null,
        }),
      });
      if (!res.ok) throw new Error("Prediction failed");
      const data = await res.json();
      setPrediction(data.predicted_bill);
      setShowResult(true);
      fetchHistory();
      setUnits("");

      // Update guest prediction count
      if (!isLoggedIn) {
        const newCount = guestPredictionCount + 1;
        setGuestPredictionCount(newCount);
        const today = new Date().toDateString();
        localStorage.setItem("guestPredictions", JSON.stringify({ date: today, count: newCount }));

        // Show login modal if guest reached limit
        if (newCount >= 4) {
          setShowLoginModal(true);
        }
      }
    } catch (err) {
      setError("Error: Is your Python backend running?");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = history.reduce((sum, item) => sum + item.predicted_bill, 0);
  const avgBill = history.length > 0 ? totalSpent / history.length : 0;
  const totalUnits = history.reduce((sum, item) => sum + item.units, 0);

  if (appLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink)",
      }}>
        <div style={{
          width: "28px",
          height: "28px",
          border: "2px solid var(--border)",
          borderTopColor: "var(--gold)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  // Show dashboard if logged in
  if (isLoggedIn && user) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

          :root {
            --gold: #c9a84c;
            --gold-light: #e8c96e;
            --gold-dim: #7a6230;
            --ink: #08080a;
            --paper: #0e0e12;
            --surface: #13131a;
            --surface-2: #1a1a24;
            --border: #2a2a38;
            --border-light: #38384a;
            --text-primary: #f0ece0;
            --text-secondary: #8a8a9a;
            --text-muted: #4a4a5a;
            --red: #c44;
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: var(--ink);
            color: var(--text-primary);
            font-family: 'IBM Plex Sans', sans-serif;
          }

          .dashboard-app {
            min-height: 100vh;
            background:
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 40% 40% at 90% 80%, rgba(201,168,76,0.03) 0%, transparent 50%),
              var(--ink);
          }

          .noise-overlay {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            opacity: 0.025;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            background-size: 180px;
          }

          .dashboard-container {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 48px 32px;
          }

          .panel {
            background: var(--surface);
            border: 1px solid var(--border);
            position: relative;
            margin-top: 48px;
          }

          .panel::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, var(--gold) 0%, transparent 60%);
          }

          .panel-body { padding: 28px; }

          .panel-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--text-secondary);
            font-weight: 500;
            margin-bottom: 28px;
          }

          .panel-title svg { color: var(--gold); }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        <div className="dashboard-app">
          <div className="noise-overlay" />
          <div className="dashboard-container">
            <UserDashboard user={user} onLogout={handleLogout} />

            {/* Prediction Form Section for Logged In Users */}
            <div className="panel">
              <div className="panel-body">
                <div className="panel-title">
                  <Activity size={14} />
                  Make a Prediction
                </div>
                <PredictionForm
                  units={units}
                  setUnits={(val) => { setUnits(val); setInputError(""); }}
                  onPredict={handlePredict}
                  loading={loading}
                  error={inputError}
                />
                {prediction !== null && showResult && (
                  <div style={{ marginTop: "28px" }}>
                    <PredictionResult value={prediction} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=IBM+Plex+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

        :root {
          --gold: #c9a84c;
          --gold-light: #e8c96e;
          --gold-dim: #7a6230;
          --ink: #08080a;
          --paper: #0e0e12;
          --surface: #13131a;
          --surface-2: #1a1a24;
          --border: #2a2a38;
          --border-light: #38384a;
          --text-primary: #f0ece0;
          --text-secondary: #8a8a9a;
          --text-muted: #4a4a5a;
          --red: #c44;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--ink);
          color: var(--text-primary);
          font-family: 'IBM Plex Sans', sans-serif;
        }

        .bill-app {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 90% 80%, rgba(201,168,76,0.03) 0%, transparent 50%),
            var(--ink);
        }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 32px;
        }

        /* HEADER */
        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 64px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border);
          position: relative;
        }

        .header::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 120px;
          height: 1px;
          background: var(--gold);
        }

        .brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .brand-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 400;
        }

        .brand-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .brand-name span {
          color: var(--gold);
        }

        .brand-sub {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .header-stats {
          display: flex;
          gap: 40px;
          align-items: flex-end;
        }

        .stat-item {
          text-align: right;
        }

        .stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .stat-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .stat-value.gold { color: var(--gold); }

        /* ERROR */
        .error-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: rgba(204,68,68,0.06);
          border: 1px solid rgba(204,68,68,0.2);
          border-left: 3px solid var(--red);
          margin-bottom: 40px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: rgba(240,180,180,0.8);
        }

        /* GRID */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .main-grid { grid-template-columns: 1fr; }
          .header { flex-direction: column; align-items: flex-start; gap: 24px; }
          .header-stats { gap: 24px; }
          .stat-item { text-align: left; }
        }

        .left-col { display: flex; flex-direction: column; gap: 24px; }

        /* PANELS */
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
        }

        .panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 60%);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 28px;
          border-bottom: 1px solid var(--border);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .panel-title svg { color: var(--gold); }

        .panel-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.2);
          padding: 3px 10px;
        }

        .panel-body { padding: 28px; }

        /* HISTORY STATS */
        .history-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid var(--border);
        }

        .h-stat {
          padding: 20px 24px;
          border-right: 1px solid var(--border);
        }

        .h-stat:last-child { border-right: none; }

        .h-stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .h-stat-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 20px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .h-stat-value.gold { color: var(--gold); }
        .h-stat-value.amber { color: #d4a843; }

        /* FOOTER */
        .footer {
          margin-top: 64px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--text-muted);
        }

        .footer-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--border-light);
        }

        .dot:first-child { background: var(--gold); }

        /* CLEAR BTN */
        .clear-btn {
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .clear-btn:hover {
          color: #e07070;
          border-color: rgba(204,68,68,0.2);
          background: rgba(204,68,68,0.04);
        }
      `}</style>

      <div className="bill-app">
        <div className="noise-overlay" />
        <div className="container">
          {/* Header */}
          <header className="header">
            <div className="brand">
              <div className="brand-eyebrow">Energy Intelligence Platform</div>
              <div className="brand-name">Bill<span>Insight</span></div>
              <div className="brand-sub">AI-Powered Cost Prediction Engine</div>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <div className="stat-label">Predictions</div>
                <div className="stat-value">{String(history.length).padStart(2, '0')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Avg. Bill</div>
                <div className="stat-value gold">${avgBill.toFixed(2)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Units</div>
                <div className="stat-value">{totalUnits.toFixed(0)}</div>
              </div>
            </div>
          </header>

          {/* Error */}
          {error && (
            <div className="error-bar">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Main Grid */}
          <div className="main-grid">
            {/* Left */}
            <div className="left-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Activity size={14} />
                    Usage Analysis
                  </div>
                  <div className="panel-badge">ML Model</div>
                </div>
                <div className="panel-body">
                  <PredictionForm
                    units={units}
                    setUnits={(val) => { setUnits(val); setInputError(""); }}
                    onPredict={handlePredict}
                    loading={loading}
                    error={inputError}
                  />
                </div>
              </div>

              {prediction !== null && showResult && (
                <PredictionResult value={prediction} />
              )}
            </div>

            {/* Right */}
            <div className="panel" style={{ minHeight: 520 }}>
              <div className="panel-header">
                <div className="panel-title">
                  <History size={14} />
                  Prediction Log
                </div>
                {history.length > 0 && (
                  <button className="clear-btn" onClick={clearAllHistory}>
                    <Trash2 size={11} />
                    Purge All
                  </button>
                )}
              </div>

              {!isLoggedIn ? (
                <div style={{
                  padding: "80px 24px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                  borderTop: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                  }}>
                    <History size={24} />
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                  }}>
                    Sign In to View History
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    letterSpacing: "0.05em",
                  }}>
                    Create an account to save and track your predictions
                  </div>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    style={{
                      marginTop: "12px",
                      background: "var(--gold)",
                      border: "none",
                      color: "var(--ink)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontWeight: "600",
                      padding: "10px 16px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--gold-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--gold)";
                    }}
                  >
                    Sign In Now
                  </button>
                </div>
              ) : (
                <>
                  {history.length > 0 && (
                    <div className="history-stats">
                      <div className="h-stat">
                        <div className="h-stat-label">Total Spent</div>
                        <div className="h-stat-value gold">${totalSpent.toFixed(2)}</div>
                      </div>
                      <div className="h-stat">
                        <div className="h-stat-label">Average</div>
                        <div className="h-stat-value amber">${avgBill.toFixed(2)}</div>
                      </div>
                      <div className="h-stat">
                        <div className="h-stat-label">kWh Tracked</div>
                        <div className="h-stat-value">{totalUnits.toFixed(0)}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '24px' }}>
                    <HistoryList
                      history={history}
                      loading={historyLoading}
                      onDelete={deleteHistoryItem}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-text">Powered by Machine Learning · Real-time Predictions</div>
            <div className="footer-dots">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </footer>
        </div>
      </div>

      {/* Guest Prediction Counter Info */}
      {!isLoggedIn && guestPredictionCount > 0 && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "2px solid var(--gold)",
          padding: "12px 16px",
          zIndex: 9998,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "11px",
          color: "var(--text-secondary)",
        }}>
          <div>Guest Mode: {guestPredictionCount}/4 daily predictions used</div>
          {guestPredictionCount >= 4 && (
            <div style={{ color: "var(--gold)", marginTop: "4px" }}>
              Limit reached. Sign up for unlimited!
            </div>
          )}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <Login onLoginSuccess={handleLoginSuccess} isModal={true} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}