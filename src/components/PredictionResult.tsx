import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function PredictionResult({ value }: { value: number }) {
  return (
    <>
      <style>{`
        .result-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }

        .result-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: var(--gold);
        }

        .result-inner {
          padding: 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .result-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .result-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .result-check {
          color: var(--gold);
          opacity: 0.6;
        }

        .result-amount {
          font-family: 'Playfair Display', serif;
          font-size: clamp(42px, 7vw, 60px);
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .result-currency {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          font-weight: 300;
          color: var(--gold);
          margin-right: 4px;
          vertical-align: super;
        }

        .result-sub {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          margin-top: 8px;
        }

        .result-badge {
          text-align: right;
        }

        .result-badge-circle {
          width: 56px;
          height: 56px;
          border: 1px solid rgba(201,168,76,0.2);
          background: rgba(201,168,76,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .result-badge-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-top: 8px;
          text-align: center;
        }

        .result-divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 0 28px;
        }

        .result-footer {
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .result-footer-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }

        .result-confidence {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .conf-bar {
          width: 60px;
          height: 2px;
          background: var(--border);
          position: relative;
          overflow: hidden;
        }

        .conf-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          background: var(--gold);
          width: 87%;
        }

        .conf-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: var(--gold);
        }

        .result-bg-text {
          position: absolute;
          bottom: -10px;
          right: 20px;
          font-family: 'Playfair Display', serif;
          font-size: 100px;
          font-weight: 900;
          color: rgba(201,168,76,0.03);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          letter-spacing: -0.04em;
        }
      `}</style>

      <motion.div
        className="result-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="result-inner">
          <div>
            <div className="result-label-row">
              <span className="result-label">Predicted Bill</span>
              <CheckCircle2 className="result-check" size={12} />
            </div>
            <div className="result-amount">
              <span className="result-currency">$</span>
              {value.toFixed(2)}
            </div>
            <div className="result-sub">Estimated monthly cost</div>
          </div>
          <div className="result-badge">
            <div className="result-badge-circle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div className="result-badge-label">AI Result</div>
          </div>
          <div className="result-bg-text">${value.toFixed(0)}</div>
        </div>

        <hr className="result-divider" />

        <div className="result-footer">
          <span className="result-footer-text">Model confidence</span>
          <div className="result-confidence">
            <div className="conf-bar"><div className="conf-fill" /></div>
            <span className="conf-label">87%</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}