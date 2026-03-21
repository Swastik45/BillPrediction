import React from 'react';
import { Zap, AlertCircle, ArrowRight } from 'lucide-react';

interface PredictionFormProps {
  units: string;
  setUnits: (val: string) => void;
  onPredict: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string;
}

export default function PredictionForm({ units, setUnits, onPredict, loading, error }: PredictionFormProps) {
  return (
    <>
      <style>{`
        .form-wrap { display: flex; flex-direction: column; gap: 28px; }

        .field-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
          display: block;
        }

        .input-shell {
          position: relative;
          display: flex;
          align-items: stretch;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gold-dim);
          pointer-events: none;
          transition: color 0.2s;
        }

        .input-shell:focus-within .input-icon {
          color: var(--gold);
        }

        .num-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-bottom: 2px solid var(--border);
          color: var(--text-primary);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          padding: 18px 70px 18px 48px;
          outline: none;
          transition: all 0.2s;
          appearance: textfield;
          -moz-appearance: textfield;
        }

        .num-input::-webkit-outer-spin-button,
        .num-input::-webkit-inner-spin-button { -webkit-appearance: none; }

        .num-input::placeholder {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 300;
        }

        .num-input:focus {
          border-color: var(--border-light);
          border-bottom-color: var(--gold);
          background: var(--surface);
        }

        .num-input.has-error {
          border-bottom-color: var(--red);
        }

        .input-unit {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--gold-dim);
          text-transform: uppercase;
        }

        .input-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #e08080;
        }

        .predict-btn {
          width: 100%;
          background: var(--gold);
          border: none;
          color: var(--ink);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 18px 28px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .predict-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }

        .predict-btn:hover::after { background: rgba(255,255,255,0.08); }

        .predict-btn:active { transform: scale(0.995); }

        .predict-btn:disabled {
          background: var(--surface-2);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .predict-btn:disabled::after { display: none; }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(8,8,10,0.2);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .helper-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          line-height: 1.6;
        }

        .helper-text span { color: var(--gold-dim); }
      `}</style>

      <form onSubmit={onPredict} className="form-wrap">
        <div>
          <label className="field-label">Monthly kWh Consumption</label>
          <div className="input-shell">
            <Zap className="input-icon" size={16} />
            <input
              type="number"
              step="any"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              placeholder="0.00"
              className={`num-input${error ? ' has-error' : ''}`}
              required
            />
            <span className="input-unit">kWh</span>
          </div>
          {error && (
            <div className="input-error">
              <AlertCircle size={12} />
              {error}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="predict-btn">
          {loading ? (
            <div className="spinner" />
          ) : (
            <div className="btn-inner">
              <span>Run Prediction</span>
              <ArrowRight size={16} />
            </div>
          )}
        </button>

        <p className="helper-text">
          Enter your estimated consumption to generate an <span>AI-powered</span> cost forecast using real-time pricing models.
        </p>
      </form>
    </>
  );
}