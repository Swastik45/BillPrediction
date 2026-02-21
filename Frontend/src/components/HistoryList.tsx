import { Calendar, Zap, Trash2 } from 'lucide-react';

interface HistoryItem {
  id?: number;
  units: number;
  predicted_bill: number;
  timestamp: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  onDelete?: (id: number) => void;
  loading?: boolean;
}

export default function HistoryList({ history, onDelete, loading }: HistoryListProps) {
  if (loading) {
    return (
      <>
        <style>{`
          .hist-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 0;
            gap: 16px;
          }
          .hist-spinner {
            width: 24px; height: 24px;
            border: 1px solid var(--border);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .hist-loading-text {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--text-muted);
          }
        `}</style>
        <div className="hist-loading">
          <div className="hist-spinner" />
          <span className="hist-loading-text">Loading records...</span>
        </div>
      </>
    );
  }

  if (history.length === 0) {
    return (
      <>
        <style>{`
          .hist-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 0;
            gap: 16px;
            border: 1px dashed var(--border);
          }
          .hist-empty-icon {
            width: 48px; height: 48px;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
          }
          .hist-empty-title {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            letter-spacing: 0.12em;
            color: var(--text-secondary);
            text-transform: uppercase;
          }
          .hist-empty-sub {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 10px;
            color: var(--text-muted);
            letter-spacing: 0.05em;
          }
        `}</style>
        <div className="hist-empty">
          <div className="hist-empty-icon">
            <Zap size={18} />
          </div>
          <div className="hist-empty-title">No records</div>
          <div className="hist-empty-sub">Run an analysis to populate the log</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .hist-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          max-height: 420px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .hist-list::-webkit-scrollbar { width: 3px; }
        .hist-list::-webkit-scrollbar-track { background: transparent; }
        .hist-list::-webkit-scrollbar-thumb { background: var(--border); }

        .hist-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid var(--border);
          position: relative;
          transition: all 0.15s;
          cursor: default;
        }

        .hist-row:last-child { border-bottom: none; }

        .hist-row::before {
          content: '';
          position: absolute;
          left: -24px;
          right: -24px;
          top: 0; bottom: 0;
          background: transparent;
          transition: background 0.15s;
        }

        .hist-row:hover::before {
          background: rgba(201,168,76,0.02);
        }

        .hist-row-left {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .hist-index {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
          width: 20px;
          text-align: right;
          flex-shrink: 0;
        }

        .hist-row-info {}

        .hist-units {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .hist-units span {
          font-size: 10px;
          font-weight: 300;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-left: 4px;
          text-transform: uppercase;
        }

        .hist-date {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .hist-row-right {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .hist-amount {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 18px;
          font-weight: 500;
          color: var(--gold);
          text-align: right;
        }

        .hist-amount-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: right;
          margin-top: 2px;
        }

        .hist-delete {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 6px;
          opacity: 0;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hist-row:hover .hist-delete { opacity: 1; }
        .hist-delete:hover { color: #e07070; }
      `}</style>

      <div className="hist-list">
        {history.map((item, idx) => (
          <div key={idx} className="hist-row">
            <div className="hist-row-left">
              <div className="hist-index">{String(history.length - idx).padStart(2, '0')}</div>
              <div className="hist-row-info">
                <div className="hist-units">
                  {item.units}<span>kWh</span>
                </div>
                <div className="hist-date">
                  <Calendar size={10} />
                  {new Date(item.timestamp).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="hist-row-right">
              <div>
                <div className="hist-amount">${item.predicted_bill.toFixed(2)}</div>
                <div className="hist-amount-label">Est. Cost</div>
              </div>
              {onDelete && item.id && (
                <button className="hist-delete" onClick={() => onDelete(item.id!)}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}