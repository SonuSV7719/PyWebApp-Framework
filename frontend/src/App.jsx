import React, { useState, useEffect, useCallback } from 'react';
import { call, getPlatform, pickFile } from 'pywebapp-bridge';
import './App.css';

// Generic card component for the dashboard
const DashboardCard = ({ title, icon, children, loading, error }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <span className="card-icon">{icon}</span>
      <h3>{title}</h3>
    </div>
    <div className="card-body">
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Processing natively...</span>
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export default function App() {
  const platform = getPlatform();

  // ─── 1. Telemetry State ───
  const [telemetry, setTelemetry] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // ─── 2. Database State ───
  const [logs, setLogs] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [newLog, setNewLog] = useState('');

  // ─── 3. File Crypto State ───
  const [hashResult, setHashResult] = useState(null);
  const [hashLoading, setHashLoading] = useState(false);
  const [hashError, setHashError] = useState('');

  // ─── 4. Network State ───
  const [pingTarget, setPingTarget] = useState('https://google.com');
  const [pingResult, setPingResult] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);
  const [pingError, setPingError] = useState('');

  // ─── 5. Permissions State ───
  const [permLoading, setPermLoading] = useState(false);
  const [permResult, setPermResult] = useState(null);

  // ─── Handlers ───

  const loadTelemetry = async () => {
    setTelemetryLoading(true);
    try {
      const res = await call('get_device_telemetry');
      if (res.success !== false) setTelemetry(res);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const loadDatabase = async () => {
    setDbLoading(true);
    try {
      const res = await call('fetch_logs');
      if (Array.isArray(res)) setLogs(res);
    } finally {
      setDbLoading(false);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    setDbLoading(true);
    await call('add_log', [newLog]);
    setNewLog('');
    await loadDatabase();
  };

  const handleHashFile = async () => {
    setHashLoading(true);
    setHashError('');
    setHashResult(null);
    try {
      const fileRes = await pickFile();
      if (fileRes.success && fileRes.uri) {
        // If path exists (Android/Desktop native path), use it. Otherwise web URI fallback won't work for native hashing
        const targetPath = fileRes.path || fileRes.uri; 
        const res = await call('calculate_file_hash', [targetPath]);
        
        if (res.success) {
          setHashResult({ ...res, name: fileRes.name || targetPath.split('/').pop() });
        } else {
          setHashError(res.error);
        }
      } else if (fileRes.error !== 'Cancelled') {
        setHashError(fileRes.error);
      }
    } catch (err) {
      setHashError(err.message);
    } finally {
      setHashLoading(false);
    }
  };

  const handlePing = async (e) => {
    e.preventDefault();
    setPingLoading(true);
    setPingError('');
    try {
      const res = await call('ping_server', [pingTarget]);
      if (res.success) setPingResult(res);
      else setPingError(res.error);
    } catch (err) {
      setPingError(err.message);
    } finally {
      setPingLoading(false);
    }
  };

  const handleRequestCamera = async () => {
    setPermLoading(true);
    setPermResult(null);
    try {
      // 1. Check if we already have it natively via Python
      const checkRes = await call('check_permission', ['android.permission.CAMERA']);
      if (checkRes.granted) {
        setPermResult('Granted ✅ (Already possessed)');
        return;
      }
      
      // 2. Request it natively via Python
      const reqRes = await call('request_permission_python', ['android.permission.CAMERA']);
      setPermResult(reqRes.granted ? 'Granted ✅' : 'Denied ❌');
    } catch (err) {
      setPermResult('Error: ' + err.message);
    } finally {
      setPermLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Hide native splash screen on Android once React mounts
    if (window.NativeBridge && window.NativeBridge.hideSplash) {
      window.NativeBridge.hideSplash();
    }
    
    loadTelemetry();
    loadDatabase();
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">⚡</div>
          <h2>App Dashboard</h2>
        </div>
        
        <div className="status-module">
          <h4>Native API Status</h4>
          <div className="status-indicator connected">
            <span className="dot"></span>
            Connected
          </div>
          <p className="platform-text">Target: <strong>{platform}</strong></p>
        </div>

        <nav className="nav-menu">
          <a href="#" className="nav-item active">⊞ Overview</a>
          <a href="#" className="nav-item">⚙️ Settings</a>
          <a href="#" className="nav-item">📚 Documentation</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header">
          <h1>System Overview</h1>
          <p>Real-time data powered by the native backend</p>
        </header>

        <div className="grid-container">
          
          {/* Telemetry Card */}
          <DashboardCard title="Hardware Telemetry" icon="💻" loading={telemetryLoading}>
            {telemetry ? (
              <ul className="data-list">
                <li><span>OS</span> <strong>{telemetry.os} {telemetry.release}</strong></li>
                <li><span>Architecture</span> <strong>{telemetry.architecture}</strong></li>
                <li><span>CPU Cores</span> <strong>{telemetry.cpu_cores}</strong></li>
                <li><span>Python Engine</span> <strong>v{telemetry.python_version}</strong></li>
              </ul>
            ) : (
              <button className="btn" onClick={loadTelemetry}>Load Telemetry</button>
            )}
          </DashboardCard>

          {/* SQLite Card */}
          <DashboardCard title="SQLite Database" icon="🗄️" loading={dbLoading}>
            <form onSubmit={handleAddLog} className="input-group">
              <input 
                type="text" 
                value={newLog} 
                onChange={e => setNewLog(e.target.value)} 
                placeholder="Enter a log entry..." 
                className="text-input"
              />
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
            <div className="log-list">
              {logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="log-item">
                  <span className="log-id">#{log.id}</span>
                  <span className="log-action">{log.action}</span>
                </div>
              )) : <p className="empty-state">No logs found in database.</p>}
            </div>
          </DashboardCard>

          {/* File Crypto Card */}
          <DashboardCard title="SHA-256 File Crypto" icon="🔐" loading={hashLoading} error={hashError}>
            <p className="description">Select a local file to calculate its cryptographic hash natively in Python.</p>
            <button className="btn btn-accent" onClick={handleHashFile}>
              Select File to Hash
            </button>
            
            {hashResult && (
              <div className="result-box success">
                <p><strong>File:</strong> {hashResult.name}</p>
                <p><strong>Size:</strong> {hashResult.size_mb} MB</p>
                <p className="hash-string"><strong>Hash:</strong><br/>{hashResult.hash}</p>
              </div>
            )}
          </DashboardCard>

          {/* Network Diagnostics Card */}
          <DashboardCard title="Network Diagnostics" icon="📡" loading={pingLoading} error={pingError}>
            <form onSubmit={handlePing} className="input-group">
              <input 
                type="text" 
                value={pingTarget} 
                onChange={e => setPingTarget(e.target.value)} 
                placeholder="https://..." 
                className="text-input"
              />
              <button type="submit" className="btn btn-secondary">Ping</button>
            </form>
            
            {pingResult && (
              <div className="result-box info">
                <div className="metric">
                  <span className="metric-value">{pingResult.latency_ms} <small>ms</small></span>
                  <span className="metric-label">Latency to {pingTarget}</span>
                </div>
                <p style={{marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                  HTTP Status: {pingResult.status}
                </p>
              </div>
            )}
          </DashboardCard>

          {/* Native Permissions Card */}
          <DashboardCard title="Python-Driven Permissions" icon="🛡️" loading={permLoading}>
            <p className="description">
              Check and request native Android permissions utilizing the extensive <code>pywebapp.plugins.permissions</code> module entirely from Python.
            </p>
            <button className="btn btn-info" onClick={handleRequestCamera} style={{width: '100%'}}>
              Request Camera via Python
            </button>
            {permResult && (
              <div className={`result-box ${permResult.includes('Granted') ? 'success' : 'error'}`} style={{marginTop: '15px'}}>
                <p><strong>Status:</strong> {permResult}</p>
              </div>
            )}
          </DashboardCard>

        </div>
      </main>
    </div>
  );
}
