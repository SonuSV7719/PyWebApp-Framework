package com.example.pywebapp

import android.annotation.SuppressLint
import android.content.Intent
import android.content.IntentFilter
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewAssetLoader.AssetsPathHandler
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import com.example.pywebapp.dev.DevReloadReceiver

/**
 * MainActivity — Hosts the WebView and initializes the Python runtime.
 *
 * Supports two modes:
 *   - Production: loads frontend from bundled assets, Python from APK
 *   - Dev mode: loads frontend from Vite dev server (HMR), Python reloads via ADB push
 *
 * Architecture:
 *   WebView loads React frontend
 *   PythonBridge registered as "NativeBridge" JavascriptInterface
 *   JS calls → PythonBridge → Chaquopy → Python handlers → callback to JS
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var pythonBridge: PythonBridge
    private lateinit var assetLoader: WebViewAssetLoader
    private var devReloadReceiver: DevReloadReceiver? = null

    companion object {
        private const val TAG = "PyWebApp"

        // ─── Dev Mode Configuration ─────────────────────────────
        // Automatically enabled for Debug builds.
        // In dev mode:
        //   - Frontend loads from Vite dev server (HMR)
        //   - Python loads from /data/local/tmp/pywebapp/python/ (ADB push)
        //   - BroadcastReceiver listens for reload signals
        private val DEV_MODE = BuildConfig.DEBUG  // Auto-detect based on build type

        // Vite dev server URL — 10.0.2.2 is Android emulator's alias for host machine.
        // Works reliably because vite.config.js binds to 0.0.0.0 with allowedHosts:'all'.
        private const val DEV_SERVER_URL = "http://10.0.2.2:5173"

        // Production frontend URL (Virtual domain managed by WebViewAssetLoader)
        private const val PROD_FRONTEND_URL = "https://appassets.android.com/web/index.html"

        // Dev mode: where ADB-pushed Python files live on the device
        private const val DEV_PYTHON_DIR = "/data/local/tmp/pywebapp/python"
    }

    // 📸 MODERN PHOTO PICKER: The smooth, flicker-free way to pick images
    private val photoPicker = registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        pendingCallbackId?.let { cbId ->
            if (uri != null) {
                pythonBridge.sendResultToJs(cbId, """{"success":true,"uri":"$uri"}""")
            } else {
                pythonBridge.sendResultToJs(cbId, """{"success":false,"error":"No image selected"}""")
            }
            pendingCallbackId = null
        }
    }

    // 🔐 UNIVERSAL PERMISSION LAUNCHER: Real-time Allow/Deny popup
    private val permissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        pendingCallbackId?.let { cbId ->
            pythonBridge.sendResultToJs(cbId, """{"success":true,"granted":$isGranted}""")
            pendingCallbackId = null
        }
    }

    // UNIVERSAL HUB: Generic launcher for any Android Intent (Picking files, images, etc.)
    private var pendingCallbackId: String? = null
    private val universalLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        pendingCallbackId?.let { cbId ->
            if (result.resultCode == RESULT_OK) {
                val data = result.data?.data?.toString() ?: ""
                pythonBridge.sendResultToJs(cbId, """{"success":true,"uri":"$data"}""")
            } else {
                pythonBridge.sendResultToJs(cbId, """{"success":false,"error":"User cancelled"}""")
            }
            pendingCallbackId = null
        }
    }

    /**
     * UNIVERSAL PICKER: Trigger any pick intent from the bridge
     */
    fun launchUniversalPicker(intent: Intent, callbackId: String) {
        runOnUiThread {
            this.pendingCallbackId = callbackId
            universalLauncher.launch(intent)
        }
    }

    /**
     * REAL PERMISSION REQUEST: Shows the Android system popup
     */
    fun requestRuntimePermission(permission: String, callbackId: String) {
        runOnUiThread {
            this.pendingCallbackId = callbackId
            permissionLauncher.launch(permission)
        }
    }

    private var splashLayout: android.view.View? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize Python runtime (Chaquopy)
        initPython()

        // Setup WebView
        webView = findViewById(R.id.webView)
        setupWebView()

        // 🚀 Setup Splash Overlay
        showSplashOverlay()

        // Create and register the Python bridge
        pythonBridge = PythonBridge(this, webView)
        registerBridge()

        // Register dev reload receiver (dev mode only)
        if (DEV_MODE) {
            registerDevReloadReceiver()
        }

        // Load the frontend
        val url = if (DEV_MODE) DEV_SERVER_URL else PROD_FRONTEND_URL
        webView.loadUrl(url)
        Log.i(TAG, "Frontend loaded from: $url (dev=$DEV_MODE)")
    }

    private fun showSplashOverlay() {
        val splashId = resources.getIdentifier("splash_logo", "drawable", packageName)
        if (splashId == 0) return

        val root = findViewById<android.view.ViewGroup>(android.R.id.content)
        val layout = android.widget.FrameLayout(this)
        layout.layoutParams = android.widget.FrameLayout.LayoutParams(
            android.view.ViewGroup.LayoutParams.MATCH_PARENT,
            android.view.ViewGroup.LayoutParams.MATCH_PARENT
        )
        layout.setBackgroundColor(android.graphics.Color.parseColor("#1a1a1a"))

        val logo = android.widget.ImageView(this)
        val logoSize = (180 * resources.displayMetrics.density).toInt()
        val params = android.widget.FrameLayout.LayoutParams(logoSize, logoSize)
        params.gravity = android.view.Gravity.CENTER
        logo.layoutParams = params
        logo.setImageResource(splashId)

        layout.addView(logo)
        root.addView(layout)
        this.splashLayout = layout
    }

    fun hideSplashScreen() {
        runOnUiThread {
            splashLayout?.animate()
                ?.alpha(0f)
                ?.setDuration(400)
                ?.withEndAction {
                    (splashLayout?.parent as? android.view.ViewGroup)?.removeView(splashLayout)
                    splashLayout = null
                }
        }
    }

    /**
     * Initialize the Chaquopy Python interpreter.
     *
     * In dev mode, also prepends the ADB push directory to sys.path
     * so updated Python files take priority over bundled ones.
     */
    private fun initPython() {
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(this))
            Log.i(TAG, "Python runtime initialized")
        }

        if (DEV_MODE) {
            try {
                val py = Python.getInstance()
                val sys = py.getModule("sys")
                val path = sys["path"]

                // Prepend dev directory so it takes priority over bundled files
                path?.callAttr("insert", 0, DEV_PYTHON_DIR)
                Log.i(TAG, "🔧 Dev mode: prepended $DEV_PYTHON_DIR to sys.path")
            } catch (e: Exception) {
                Log.w(TAG, "Failed to setup dev Python path: ${e.message}")
            }
        }
    }

    /**
     * Configure the WebView for optimal React app rendering.
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        // Setup Asset Loader for secure offline file access
        assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.android.com")
            .addPathHandler("/", AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            // Enable JavaScript (required for React)
            javaScriptEnabled = true

            // Enable DOM storage (React may use localStorage)
            domStorageEnabled = true

            // Allow file access (standard settings)
            allowFileAccess = true
            allowContentAccess = true
            
            // Performance optimizations
            setSupportZoom(false)
            builtInZoomControls = false

            if (DEV_MODE) {
                // Allow mixed content in dev mode (HTTP dev server)
                mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
            } else {
                mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
                cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            }

            // Disable system-wide Force Dark to preserve our custom gradients
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                @Suppress("DEPRECATION")
                forceDark = android.webkit.WebSettings.FORCE_DARK_OFF
            }
        }

        // Force hardware acceleration for smooth background animations
        webView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

        // Handle console.log output in Android logcat
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(
                consoleMessage: android.webkit.ConsoleMessage?
            ): Boolean {
                consoleMessage?.let {
                    Log.d("WebView", "${it.sourceId()}:${it.lineNumber()} — ${it.message()}")
                }
                return true
            }
        }

        // Ensure links stay within the WebView and handle Asset Loading
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                val url = request.url
                val response = assetLoader.shouldInterceptRequest(url)
                
                if (response != null) {
                    Log.d(TAG, "✅ Intercepted: $url")
                } else {
                    Log.w(TAG, "❌ Failed to intercept: $url")
                }
                
                return response
            }

            @Deprecated("Deprecated in Java")
            override fun shouldInterceptRequest(
                view: WebView,
                url: String
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(Uri.parse(url))
            }

            @Suppress("DEPRECATION", "OverridingDeprecatedMember")
            override fun onReceivedError(
                view: WebView,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                Log.e(TAG, "WebView Error ($errorCode): $description for $failingUrl")
            }
        }

        // Enable remote debugging in dev mode
        if (DEV_MODE) {
            WebView.setWebContentsDebuggingEnabled(true)
            Log.i(TAG, "🔧 WebView remote debugging enabled")
        }

        Log.i(TAG, "WebView configured with AssetLoader")
    }

    /**
     * Register the PythonBridge as a JavascriptInterface.
     */
    @SuppressLint("JavascriptInterface")
    private fun registerBridge() {
        // Universal bridge — registered once in onCreate
        webView.addJavascriptInterface(pythonBridge, "NativeBridge")
        Log.i(TAG, "NativeBridge registered as JavascriptInterface")
    }

    /**
     * Register the dev reload BroadcastReceiver.
     * Listens for reload signals from the dev_sync.py script.
     */
    private fun registerDevReloadReceiver() {
        devReloadReceiver = DevReloadReceiver()
        val filter = IntentFilter(DevReloadReceiver.ACTION_RELOAD)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(devReloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            @Suppress("UnspecifiedRegisterReceiverFlag")
            registerReceiver(devReloadReceiver, filter)
        }

        Log.i(TAG, "🔧 Dev reload receiver registered")
    }

    /**
     * Handle back button — navigate WebView history before exiting.
     */
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    /**
     * Trigger the native image picker (Flicker-Free Version).
     */
    fun openImagePicker(callbackId: String) {
        runOnUiThread {
            this.pendingCallbackId = callbackId
            photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
        }
    }

    override fun onDestroy() {
        devReloadReceiver?.let {
            try { unregisterReceiver(it) } catch (_: Exception) {}
        }
        webView.destroy()
        super.onDestroy()
    }
}
