import React, { useState, useCallback } from 'react';
import { call, getPlatform, pickImage, showToast, getBase64FromUri, pickFile, openCamera } from './bridge';
import ResultCard from './components/ResultCard';

export default function App() {
  // Add calculator state
  const [numA, setNumA] = useState('5');
  const [numB, setNumB] = useState('7');
  const [addResult, setAddResult] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Operation selector for calculator
  const [operation, setOperation] = useState('add');

  // Data processor state
  const [inputData, setInputData] = useState('Hello World from PyWebApp');
  const [processResult, setProcessResult] = useState(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [processError, setProcessError] = useState('');

  // System info state
  const [sysInfo, setSysInfo] = useState(null);
  const [sysLoading, setSysLoading] = useState(false);
  const [sysError, setSysError] = useState('');

  // Fibonacci state
  const [fibN, setFibN] = useState('10');
  const [fibResult, setFibResult] = useState(null);
  const [fibLoading, setFibLoading] = useState(false);
  const [fibError, setFibError] = useState('');

  // File Processor state
  const [fileName, setFileName] = useState('test_file.txt');
  const [fileContent, setFileContent] = useState('This is some text processed by Python!');
  const [fileResult, setFileResult] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  // Image Explorer state
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPicking, setIsPicking] = useState(false);

  const platform = getPlatform();

  // ─── Handlers ─────────────────────────────────────

  const handleCalculate = useCallback(async () => {
    setAddLoading(true);
    setAddError('');
    setAddResult(null);

    try {
      const a = parseFloat(numA);
      const b = parseFloat(numB);

      if (isNaN(a) || isNaN(b)) {
        throw new Error('Please enter valid numbers');
      }

      const response = await call(operation, [a, b]);

      if (response.success) {
        setAddResult(response.result);
      } else {
        setAddError(response.error);
      }
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  }, [numA, numB, operation]);

  const handleProcessData = useCallback(async () => {
    setProcessLoading(true);
    setProcessError('');
    setProcessResult(null);

    try {
      if (!inputData.trim()) {
        throw new Error('Please enter some text to process');
      }

      const response = await call('process_data', [inputData]);

      if (response.success) {
        setProcessResult(response.result);
      } else {
        setProcessError(response.error);
      }
    } catch (err) {
      setProcessError(err.message);
    } finally {
      setProcessLoading(false);
    }
  }, [inputData]);

  const handleSystemInfo = useCallback(async () => {
    setSysLoading(true);
    setSysError('');
    setSysInfo(null);

    try {
      const response = await call('get_system_info');

      if (response.success) {
        setSysInfo(response.result);
      } else {
        setSysError(response.error);
      }
    } catch (err) {
      setSysError(err.message);
    } finally {
      setSysLoading(false);
    }
  }, []);

  const handleFibonacci = useCallback(async () => {
    setFibLoading(true);
    setFibError('');
    setFibResult(null);

    try {
      const n = parseInt(fibN, 10);
      if (isNaN(n) || n < 0) {
        throw new Error('Please enter a non-negative integer');
      }

      const response = await call('fibonacci', [n]);

      if (response.success) {
        setFibResult(response.result);
      } else {
        setFibError(response.error);
      }
    } catch (err) {
      setFibError(err.message);
    } finally {
      setFibLoading(false);
    }
  }, [fibN]);

  const handleProcessFile = useCallback(async () => {
    setFileLoading(true);
    setFileError('');
    setFileResult(null);

    try {
      if (!fileName.trim()) {
        throw new Error('Please enter a filename');
      }

      const response = await call('process_file_demo', [fileName, fileContent]);

      if (response.success) {
        setFileResult(response.result);
        showToast('File processed successfully! ✅');
      } else {
        setFileError(response.error);
      }
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  }, [fileName, fileContent]);

  const handlePickImage = useCallback(async () => {
    setIsPicking(true);
    try {
      const response = await pickImage();
      if (response.success && response.uri) {
        // Convert the native URI to a displayable Base64 string
        const b64Response = await getBase64FromUri(response.uri);
        if (b64Response.success) {
          setSelectedImage(b64Response.base64);
          showToast('Image loaded! 📸');
        } else {
          showToast('Failed to load image data');
        }
      }
    } catch (err) {
      if (err.message !== 'No image selected') {
        showToast('Error picking image: ' + err.message);
      }
    } finally {
      setIsPicking(false);
    }
  }, []);

  const handlePickFile = useCallback(async () => {
    try {
      const response = await pickFile();
      if (response.success && response.uri) {
        showToast('File selected: ' + response.uri.split('/').pop());
      }
    } catch (err) {
      showToast('Error picking file: ' + err.message);
    }
  }, []);

  const handleCamera = useCallback(async () => {
    try {
      const result = await openCamera();
      if (result.success) {
        showToast('Camera accessed successfully! 📸');
        if (result.uri) setSelectedImage(result.uri);
      }
    } catch (err) {
      showToast('Error launching camera: ' + err.message);
    }
  }, []);

  // ─── Render ───────────────────────────────────────

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <h1>PyWebApp</h1>
          </div>
          <p className="subtitle">Cross-Platform IPC Demo</p>
          <div className="platform-badge">
            <span className="badge-dot" />
            <span>{platform === 'desktop' ? 'Desktop (pywebview)' : platform === 'android' ? 'Android (Chaquopy)' : 'Dev Mode (Mock)'}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">

        {/* Calculator Section */}
        <section className="section" id="calculator-section">
          <div className="section-header">
            <h2>🧮 Calculator</h2>
            <p>Call Python arithmetic functions via IPC</p>
          </div>

          <div className="input-group">
            <div className="input-row">
              <input
                id="input-num-a"
                type="number"
                value={numA}
                onChange={(e) => setNumA(e.target.value)}
                placeholder="First number"
                className="input-field"
              />

              <select
                id="select-operation"
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="input-select"
              >
                <option value="add">+</option>
                <option value="subtract">−</option>
                <option value="multiply">×</option>
              </select>

              <input
                id="input-num-b"
                type="number"
                value={numB}
                onChange={(e) => setNumB(e.target.value)}
                placeholder="Second number"
                className="input-field"
              />
            </div>

            <button
              id="btn-calculate"
              className="btn btn-primary"
              onClick={handleCalculate}
              disabled={addLoading}
            >
              {addLoading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>

          <ResultCard
            title="Result"
            result={addResult}
            loading={addLoading}
            error={addError}
            icon="🔢"
          />
        </section>

        {/* Data Processor Section */}
        <section className="section" id="processor-section">
          <div className="section-header">
            <h2>📊 Data Processor</h2>
            <p>Send text to Python for analysis</p>
          </div>

          <div className="input-group">
            <textarea
              id="input-data"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter text to process..."
              className="input-textarea"
              rows={3}
            />
            <button
              id="btn-process"
              className="btn btn-secondary"
              onClick={handleProcessData}
              disabled={processLoading}
            >
              {processLoading ? 'Processing...' : 'Process Data'}
            </button>
          </div>

          <ResultCard
            title="Analysis"
            result={processResult}
            loading={processLoading}
            error={processError}
            icon="📈"
          />
        </section>

        {/* Fibonacci Section */}
        <section className="section" id="fibonacci-section">
          <div className="section-header">
            <h2>🌀 Fibonacci Generator</h2>
            <p>Generate Fibonacci sequence via Python</p>
          </div>

          <div className="input-group">
            <div className="input-row">
              <input
                id="input-fib-n"
                type="number"
                value={fibN}
                onChange={(e) => setFibN(e.target.value)}
                placeholder="Number of terms"
                className="input-field"
                min="0"
                max="100"
              />
              <button
                id="btn-fibonacci"
                className="btn btn-accent"
                onClick={handleFibonacci}
                disabled={fibLoading}
              >
                {fibLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          <ResultCard
            title="Sequence"
            result={fibResult}
            loading={fibLoading}
            error={fibError}
            icon="🔗"
          />
        </section>

        {/* System Info Section */}
        <section className="section" id="sysinfo-section">
          <div className="section-header">
            <h2>💻 System Info</h2>
            <p>Fetch platform info from Python runtime</p>
          </div>

          <div className="input-group">
            <button
              id="btn-sysinfo"
              className="btn btn-info"
              onClick={handleSystemInfo}
              disabled={sysLoading}
            >
              {sysLoading ? 'Fetching...' : 'Get System Info'}
            </button>
          </div>

          <ResultCard
            title="Platform Details"
            result={sysInfo}
            loading={sysLoading}
            error={sysError}
            icon="🖥️"
          />
        </section>

        {/* File Processor Section */}
        <section className="section" id="file-processor-section">
          <div className="section-header">
            <h2>📂 File Processor</h2>
            <p>Write and Read files from Android Storage via Python</p>
          </div>

          <div className="input-group">
            <input
              id="input-filename"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Filename (e.g. data.txt)"
              className="input-field"
              style={{ marginBottom: '8px' }}
            />
            <textarea
              id="input-file-content"
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Enter file content..."
              className="input-textarea"
              rows={2}
            />
            <button
              id="btn-process-file"
              className="btn btn-primary"
              onClick={handleProcessFile}
              disabled={fileLoading}
            >
              {fileLoading ? 'Processing File...' : 'Save & Read File'}
            </button>
          </div>

          <ResultCard
            title="File I/O Result"
            result={fileResult}
            loading={fileLoading}
            error={fileError}
            icon="💾"
          />
        </section>

        {/* Image Explorer Section */}
        <section className="section" id="image-explorer-section">
          <div className="section-header">
            <h2>📸 Image Explorer</h2>
            <p>Select and view images from your gallery</p>
          </div>

          <div className="input-group">
            <button
              id="btn-pick-image"
              className="btn btn-accent"
              onClick={handlePickImage}
              disabled={isPicking}
              style={{ width: '100%', marginBottom: '10px' }}
            >
              {isPicking ? 'Opening Gallery...' : '🖼️ Pick Image (Flicker-Free)'}
            </button>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                id="btn-pick-file"
                className="btn btn-secondary"
                onClick={handlePickFile}
                style={{ flex: 1 }}
              >
                📁 Pick Any File
              </button>
              <button
                id="btn-camera"
                className="btn btn-info"
                onClick={handleCamera}
                style={{ flex: 1 }}
              >
                📷 Open Camera
              </button>
            </div>

            {selectedImage && (
              <div className="image-preview-container" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '8px' }}>Previewing: {selectedImage.substring(0, 50)}...</p>
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="image-preview"
                  style={{ 
                    maxWidth: '100%', 
                    borderRadius: '12px', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }} 
                />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built with <span className="heart">♥</span> using React + Python IPC
        </p>
        <p className="footer-small">No HTTP servers — Pure IPC communication</p>
      </footer>
    </div>
  );
}
