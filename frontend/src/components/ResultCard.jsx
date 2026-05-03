import React from 'react';
import './ResultCard.css';

/**
 * ResultCard — Displays IPC call results with animation.
 *
 * Props:
 *   title    (string)  — Card title / method name
 *   result   (any)     — The result data to display
 *   loading  (bool)    — Whether the call is in progress
 *   error    (string)  — Error message if call failed
 *   icon     (string)  — Emoji icon for the card
 */
export default function ResultCard({ title, result, loading, error, icon = '📦' }) {
  const renderResult = (data) => {
    if (data === null || data === undefined) {
      return <span className="result-placeholder">No result yet</span>;
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      return (
        <div className="result-object">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="result-row">
              <span className="result-key">{key}</span>
              <span className="result-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(data)) {
      return (
        <div className="result-array">
          <span className="result-value">[{data.join(', ')}]</span>
        </div>
      );
    }

    return <span className="result-scalar">{String(data)}</span>;
  };

  return (
    <div className={`result-card ${loading ? 'loading' : ''} ${error ? 'error-state' : ''} ${result !== null && result !== undefined ? 'has-result' : ''}`}>
      <div className="result-card-header">
        <span className="result-card-icon">{icon}</span>
        <h3 className="result-card-title">{title}</h3>
        {loading && <div className="spinner" />}
      </div>

      <div className="result-card-body">
        {error ? (
          <div className="result-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        ) : (
          renderResult(result)
        )}
      </div>
    </div>
  );
}
