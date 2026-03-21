"use client";

import React, { useState, useEffect } from "react";
import { LogOut, User, Mail, Calendar, BarChart3, TrendingUp } from "lucide-react";

interface UserDashboardProps {
  user: any;
  onLogout: () => void;
}

interface HistoryItem {
  id: number;
  units: number;
  predicted_bill: number;
  timestamp: string;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchUserHistory();
  }, [user]);

  const fetchUserHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/history?user_id=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError("Unable to fetch history. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    onLogout();
  };

  const totalSpent = history.reduce((sum, item) => sum + item.predicted_bill, 0);
  const avgBill = history.length > 0 ? totalSpent / history.length : 0;
  const totalUnits = history.reduce((sum, item) => sum + item.units, 0);
  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        .dashboard-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
        }

        .dashboard-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, var(--gold) 0%, transparent 60%);
        }

        .dashboard-header {
          padding: 32px 32px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .user-info {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.1);
          border: 2px solid var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .user-avatar-icon {
          color: var(--gold);
          width: 40px;
          height: 40px;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          justify-content: center;
        }

        .user-name {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .user-email {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
        }

        .user-joined {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 0;
        }

        .logout-btn:hover {
          background: rgba(201, 168, 76, 0.08);
          border-color: var(--gold);
          color: var(--gold);
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1px solid var(--border);
        }

        .stat-block {
          padding: 24px;
          border-right: 1px solid var(--border);
          text-align: center;
        }

        .stat-block:last-child {
          border-right: none;
        }

        .stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 12px;
          display: block;
        }

        .stat-value {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .stat-value.gold {
          color: var(--gold);
        }

        .dashboard-body {
          padding: 32px;
        }

        .history-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .history-title svg {
          color: var(--gold);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }

        .history-item:hover {
          border-color: var(--border-light);
          background: rgba(201, 168, 76, 0.02);
        }

        .history-item-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .history-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(201, 168, 76, 0.1);
          border: 1px solid rgba(201, 168, 76, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--gold);
        }

        .history-item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .history-item-units {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .history-item-time {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
        }

        .history-item-bill {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 14px;
          font-weight: 600;
          color: var(--gold);
          text-align: right;
        }

        .empty-state {
          text-align: center;
          padding: 60px 32px;
          background: rgba(201, 168, 76, 0.02);
          border: 1px dashed var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-state-icon {
          width: 56px;
          height: 56px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .empty-state-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }

        .empty-state-sub {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px 32px;
        }

        .spinner {
          width: 28px;
          height: 28px;
          border: 2px solid var(--border);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .dashboard-header {
            flex-direction: column;
          }

          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .stat-block {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          .stat-block:last-child {
            border-bottom: none;
          }

          .history-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .history-item-bill {
            align-self: flex-end;
          }
        }
      `}</style>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="user-info">
            <div className="user-avatar">
              <User className="user-avatar-icon" size={40} />
            </div>
            <div className="user-details">
              <h1 className="user-name">{user.full_name}</h1>
              <div className="user-email">
                <Mail size={12} />
                {user.email}
              </div>
              <div className="user-joined">
                <Calendar size={12} />
                Joined {joinDate}
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={12} />
            Logout
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-block">
            <span className="stat-label">Total Predictions</span>
            <div className="stat-value">{history.length}</div>
          </div>
          <div className="stat-block">
            <span className="stat-label">Average Bill</span>
            <div className="stat-value gold">${avgBill.toFixed(2)}</div>
          </div>
          <div className="stat-block">
            <span className="stat-label">Total Units</span>
            <div className="stat-value">{totalUnits.toFixed(0)}</div>
          </div>
        </div>

        <div className="dashboard-body">
          <div className="history-title">
            <BarChart3 size={14} />
            Prediction History
          </div>

          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(204, 68, 68, 0.06)",
                border: "1px solid rgba(204, 68, 68, 0.2)",
                borderLeft: "3px solid var(--red)",
                marginBottom: "20px",
                fontSize: "11px",
                color: "rgba(240, 180, 180, 0.8)",
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <div className="loading-text">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <TrendingUp size={28} />
              </div>
              <div className="empty-state-title">No Predictions Yet</div>
              <div className="empty-state-sub">
                Start making predictions to see your history
              </div>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-left">
                    <div className="history-item-icon">
                      <TrendingUp size={18} />
                    </div>
                    <div className="history-item-details">
                      <div className="history-item-units">
                        {item.units.toFixed(1)} Units
                      </div>
                      <div className="history-item-time">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="history-item-bill">
                    ${item.predicted_bill.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
