/**
 * NativeBridge — Universal IPC bridge for JS ↔ Python communication.
 *
 * Abstracts the platform-specific communication layer:
 *   - Desktop (pywebview): Uses window.pywebview.api.call()
 *   - Android (Chaquopy):  Uses window.NativeBridge.call() + callback
 *   - Dev mode:            Uses mock responses for UI development
 *
 * Usage:
 *   import { call } from './bridge';
 *   const result = await call('add', [5, 7]);
 *   // result = { success: true, result: 12, method: 'add' }
 */

// Pending callback registry for Android async responses
const pendingCallbacks = new Map();
let callbackIdCounter = 0;

/**
 * Resolve a pending Android callback.
 * Called from Kotlin via webView.evaluateJavascript().
 */
window.__resolveCallback = (callbackId, resultJson) => {
  const resolver = pendingCallbacks.get(callbackId);
  if (resolver) {
    try {
      const result = typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
      resolver.resolve(result);
    } catch (e) {
      resolver.reject(new Error(`Failed to parse callback result: ${e.message}`));
    }
    pendingCallbacks.delete(callbackId);
  }
};

/**
 * Detect the current platform/environment.
 */
export function detectPlatform() {
  if (window.pywebview && window.pywebview.api) {
    return 'desktop';
  }
  if (window.NativeBridge) {
    return 'android';
  }
  return 'dev';
}

/**
 * Mock responses for development mode (no native host).
 */
const MOCK_HANDLERS = {
  add: (params) => ({
    success: true,
    result: (params[0] || 0) + (params[1] || 0),
    method: 'add',
  }),
  subtract: (params) => ({
    success: true,
    result: (params[0] || 0) - (params[1] || 0),
    method: 'subtract',
  }),
  multiply: (params) => ({
    success: true,
    result: (params[0] || 0) * (params[1] || 0),
    method: 'multiply',
  }),
  process_data: (params) => ({
    success: true,
    result: {
      original: params[0] || '',
      uppercase: (params[0] || '').toUpperCase(),
      word_count: (params[0] || '').split(/\s+/).filter(Boolean).length,
      char_count: (params[0] || '').replace(/\s/g, '').length,
      reversed: (params[0] || '').split('').reverse().join(''),
      timestamp: new Date().toISOString(),
    },
    method: 'process_data',
  }),
  get_system_info: () => ({
    success: true,
    result: {
      platform: 'Browser (Dev Mode)',
      platform_release: navigator.userAgent,
      platform_version: 'N/A',
      architecture: 'N/A',
      processor: 'N/A',
      python_version: 'Mock — no Python runtime',
      hostname: window.location.hostname || 'localhost',
      timestamp: new Date().toISOString(),
    },
    method: 'get_system_info',
  }),
  fibonacci: (params) => {
    const n = params[0] || 0;
    if (n <= 0) return { success: true, result: [], method: 'fibonacci' };
    const seq = [0, 1];
    for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return { success: true, result: seq.slice(0, n), method: 'fibonacci' };
  },
  async_heavy_task: (params) => ({
    success: true,
    result: {
      status: 'completed',
      requested_duration: params[0] || 2,
      actual_duration: params[0] || 2,
      message: `Mock heavy task finished in ${params[0] || 2}s`,
      timestamp: new Date().toISOString(),
    },
    method: 'async_heavy_task',
  }),
  process_file_demo: (params) => ({
    success: true,
    result: {
      message: `Mock: File '${params[0]}' processed with content: '${params[1]}'`,
      path: '/mock/path/to/file.txt',
      timestamp: new Date().toISOString()
    },
    method: 'process_file_demo'
  })
};

/**
 * Generic IPC: Call a Python method from Javascript.
 * Works across Android (Chaquopy), Desktop (pywebview), and Web (Mock).
 */
export async function call(method, params = []) {
  const platform = detectPlatform();
  const startTime = performance.now();

  console.log(`[IPC Request] ${method}:`, params);

  try {
    let response;
    
    if (platform === 'android') {
      // Async bridge with callback registry
      return new Promise((resolve, reject) => {
        const callbackId = `call_${++callbackIdCounter}`;
        pendingCallbacks.set(callbackId, { resolve, reject });
        
        try {
          const jsonParams = JSON.stringify(params);
          window.NativeBridge.call(method, jsonParams, callbackId);
        } catch (e) {
          pendingCallbacks.delete(callbackId);
          reject(e);
        }
      });
    } else if (platform === 'desktop') {
      // Direct Promise from pywebview
      const jsonParams = JSON.stringify(params);
      const jsonResult = await window.pywebview.api.dispatch(method, jsonParams);
      response = JSON.parse(jsonResult);
    } else {
      // Mock for web development
      await new Promise(r => setTimeout(r, 100));
      const handler = MOCK_HANDLERS[method];
      if (handler) {
        response = handler(params);
      } else {
        response = { 
          success: true, 
          result: `Mock response for ${method}`,
          method 
        };
      }
    }
    
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`[IPC Response] ${method} (${duration}ms):`, response);
    return response;
  } catch (err) {
    console.error(`[IPC Error] ${method}:`, err);
    return { success: false, error: err.message, method };
  }
}

/**
 * Desktop (pywebview) — Direct Python call via js_api.
 */
async function callDesktop(method, params) {
  try {
    const paramsJson = JSON.stringify(params);
    const resultJson = await window.pywebview.api.call(method, paramsJson);
    return typeof resultJson === 'string' ? JSON.parse(resultJson) : resultJson;
  } catch (err) {
    console.error('[Bridge] Desktop call error:', err);
    return {
      success: false,
      error: `Desktop bridge error: ${err.message}`,
      method,
    };
  }
}

/**
 * Android (Chaquopy) — JavascriptInterface call with callback Promise.
 */
function callAndroid(method, params) {
  return new Promise((resolve, reject) => {
    const callbackId = `cb_${++callbackIdCounter}`;
    pendingCallbacks.set(callbackId, { resolve, reject });

    // Set a timeout to prevent hanging if callback never fires
    const timeout = setTimeout(() => {
      if (pendingCallbacks.has(callbackId)) {
        pendingCallbacks.delete(callbackId);
        reject(new Error(`Android IPC timeout for method '${method}'`));
      }
    }, 30000); // 30 second timeout

    // Store timeout handle so it can be cleared on success
    const original = pendingCallbacks.get(callbackId);
    pendingCallbacks.set(callbackId, {
      resolve: (val) => {
        clearTimeout(timeout);
        original.resolve(val);
      },
      reject: (err) => {
        clearTimeout(timeout);
        original.reject(err);
      },
    });

    try {
      const paramsJson = JSON.stringify(params);
      window.NativeBridge.call(method, paramsJson, callbackId);
    } catch (err) {
      clearTimeout(timeout);
      pendingCallbacks.delete(callbackId);
      reject(new Error(`Android bridge error: ${err.message}`));
    }
  });
}

/**
 * Dev mode — Returns mock data with simulated latency.
 */
async function callMock(method, params) {
  // Simulate network-like latency
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

  const handler = MOCK_HANDLERS[method];
  if (handler) {
    return handler(params);
  }

  return {
    success: false,
    error: `[Dev Mock] Unknown method: '${method}'`,
    method,
  };
}

/**
 * Utility: Check if the native bridge is ready.
 */
export function isBridgeReady() {
  return detectPlatform() !== 'dev' || true; // Dev mode is always "ready"
}

/**
 * Utility: Get current platform name.
 */
export function getPlatform() {
  return detectPlatform();
}

/**
 * Utility: Get system environment from native host.
 * This is the scalable way to get paths/info without changing Java/Kotlin code.
 */
export async function getSystemEnv() {
  const platform = detectPlatform();
  if (platform === 'android') {
    const envJson = window.NativeBridge.getSystemEnv();
    return JSON.parse(envJson);
  }
  // Fallback for desktop/dev
  return {
    platform: platform,
    filesDir: './local_storage',
    isMock: true
  };
}

/**
 * Utility: Request an Android permission dynamically.
 */
export function requestPermission(permission) {
  const platform = detectPlatform();
  if (platform !== 'android') {
    return Promise.resolve({ success: true, granted: true, mock: true });
  }

  return new Promise((resolve, reject) => {
    const callbackId = `perm_${++callbackIdCounter}`;
    pendingCallbacks.set(callbackId, { resolve, reject });
    window.NativeBridge.requestPermission(permission, callbackId);
  });
}

/**
 * Utility: Pick an image from the native gallery (Universal).
 */
export async function pickImage() {
  const platform = detectPlatform();
  if (platform === 'android') {
    return new Promise((resolve, reject) => {
      const callbackId = `img_${++callbackIdCounter}`;
      pendingCallbacks.set(callbackId, { resolve, reject });
      window.NativeBridge.pickImage(callbackId);
    });
  } else if (platform === 'desktop') {
    const jsonResult = await window.pywebview.api.pickFile("Select Image", ["Image Files (*.jpg;*.jpeg;*.png)", "All files (*.*)"]);
    return JSON.parse(jsonResult);
  } else if (platform === 'web' || platform === 'dev') {
    // 🌐 WEB DRIVER: Use standard HTML5 file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({ success: true, uri: event.target.result, isWeb: true });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ success: false, error: 'No file selected' });
        }
      };
      input.click();
    });
  }
  return Promise.reject(new Error('Image picking not supported on this platform'));
}

/**
 * Utility: Pick ANY file from the system (Universal).
 */
export async function pickFile() {
  const platform = detectPlatform();
  if (platform === 'android') {
    return launchIntent('android.intent.action.GET_CONTENT', '*/*');
  } else if (platform === 'desktop') {
    const jsonResult = await window.pywebview.api.pickFile("Select File", ["All files (*.*)"]);
    return JSON.parse(jsonResult);
  }
  return Promise.reject(new Error('File picking not supported on this platform'));
}

/**
 * Utility: Launch ANY Android Intent (God Mode).
 */
export function launchIntent(action, type = null) {
  const platform = detectPlatform();
  if (platform !== 'android') {
    return Promise.reject(new Error('Intents only available on Android'));
  }

  return new Promise((resolve, reject) => {
    const callbackId = `int_${++callbackIdCounter}`;
    pendingCallbacks.set(callbackId, { resolve, reject });
    window.NativeBridge.launchIntent(action, type, callbackId);
  });
}

/**
 * Utility: Share text to other apps.
 */
export function shareText(text) {
  if (detectPlatform() === 'android') {
    window.NativeBridge.shareText(text);
  } else {
    console.log('[Mock Share]:', text);
  }
}

/**
 * Utility: Show a native toast message.
 */
export function showToast(message) {
  if (detectPlatform() === 'android') {
    window.NativeBridge.showToast(message);
  } else {
    alert(message);
  }
}

/**
 * Utility: Convert a native URI to Base64 (Universal).
 */
export async function getBase64FromUri(uri) {
  const platform = detectPlatform();
  if (platform === 'android') {
    return new Promise((resolve, reject) => {
      const callbackId = `b64_${++callbackIdCounter}`;
      pendingCallbacks.set(callbackId, { resolve, reject });
      window.NativeBridge.getBase64FromUri(uri, callbackId);
    });
  } else if (platform === 'desktop') {
    const jsonResult = await window.pywebview.api.getBase64FromUri(uri);
    return JSON.parse(jsonResult);
  }
  return { success: true, base64: uri }; // Fallback for dev/mock
}
