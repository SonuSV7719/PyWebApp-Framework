package com.example.pywebapp

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.chaquo.python.Python
import com.chaquo.python.PyObject
import java.util.concurrent.Executors

/**
 * PythonBridge — JavascriptInterface that bridges JS calls to Python via Chaquopy.
 *
 * Registered as `window.NativeBridge` in the WebView.
 *
 * IPC Flow:
 *   1. JS calls `window.NativeBridge.call(method, paramsJson, callbackId)`
 *   2. This runs Python on a background thread via Chaquopy
 *   3. Result is sent back to JS via `webView.evaluateJavascript()`
 *   4. JS resolves the Promise via `window.__resolveCallback(callbackId, result)`
 *
 * Design for scalability:
 *   - Single entry point (`call`) routes all methods through Python's api.dispatch_json
 *   - Adding new Python functions requires ZERO changes to this bridge
 *   - Thread pool handles concurrent calls without blocking the UI
 */
class PythonBridge(
    private val context: android.content.Context,
    private val webView: WebView
) {
    companion object {
        private const val TAG = "PythonBridge"
        private const val THREAD_POOL_SIZE = 4
    }

    // Background thread pool for Python execution (never block the UI thread)
    private val executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE)

    // Main thread handler for evaluateJavascript (must run on UI thread)
    private val mainHandler = Handler(Looper.getMainLooper())

    init {
        // Initialize Python context on a background thread
        executor.execute {
            try {
                // 1. Fetch and set the system environment
                val contextJson = getSystemEnv()
                apiModule.callAttr("set_context", contextJson)
                
                // 2. ⚡ REGISTER NATIVE CALLBACKS: 
                // We inject a native Java function into the Python registry
                val py = Python.getInstance()
                val registry = py.getModule("pywebapp.core.registry")
                val methodRegistry = registry["method_registry"]
                
                // Lambda that calls back to the Activity
                methodRegistry?.put("internal_hide_splash", object : Runnable {
                    override fun run() {
                        (context as? MainActivity)?.hideSplashScreen()
                    }
                })

                Log.i(TAG, "Python context & native callbacks initialized")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize Python bridge hooks", e)
            }
        }
    }

    // Cached reference to the Python API module
    private val apiModule: PyObject by lazy {
        val py = Python.getInstance()
        py.getModule("api")
    }

    /**
     * SPLASH SCREEN CONTROLLER: Allows JS to dismiss the splash screen when UI is ready.
     */
    @JavascriptInterface
    fun hideSplash() {
        (context as? MainActivity)?.hideSplashScreen()
    }

    /**
     * UNIVERSAL CONTEXT HUB: Provides all Android-specific environment info to Python.
     */
    @JavascriptInterface
    fun getSystemEnv(): String {
        val env = mutableMapOf<String, Any>()
        env["filesDir"] = context.filesDir.absolutePath
        env["cacheDir"] = context.cacheDir.absolutePath
        env["packageName"] = context.packageName
        env["device"] = android.os.Build.MODEL
        env["osVersion"] = android.os.Build.VERSION.RELEASE
        env["sdkVersion"] = android.os.Build.VERSION.SDK_INT
        
        // Convert to JSON
        return com.google.gson.Gson().toJson(env)
    }

    /**
     * DYNAMIC PERMISSION REQUESTER: Scalable and Flicker-Free.
     */
    @JavascriptInterface
    fun requestPermission(permission: String, callbackId: String) {
        val permissionStatus = androidx.core.content.ContextCompat.checkSelfPermission(context, permission)
        
        if (permissionStatus == android.content.pm.PackageManager.PERMISSION_GRANTED) {
            // SILENT SUCCESS: Already granted, return immediately without flicker
            sendResultToJs(callbackId, """{"success":true,"permission":"$permission","granted":true,"silent":true}""")
        } else {
            // REAL REQUEST: Trigger the Android system popup via MainActivity
            Log.i(TAG, "Triggering real permission request: $permission")
            (context as? MainActivity)?.requestRuntimePermission(permission, callbackId)
        }
    }

    /**
     * NATIVE IMAGE PICKER: Triggered from JS, handled by the Universal Hub in Activity.
     */
    @JavascriptInterface
    fun pickImage(callbackId: String) {
        (context as? MainActivity)?.openImagePicker(callbackId)
    }

    /**
     * UNIVERSAL INTENT LAUNCHER (God Mode):
     * Allows Python/JS to trigger ANY Android action (Camera, Contacts, File Manager)
     * without ever touching Kotlin again.
     */
    @JavascriptInterface
    fun launchIntent(action: String, type: String?, callbackId: String) {
        val intent = android.content.Intent(action)
        if (type != null) intent.type = type
        (context as? MainActivity)?.launchUniversalPicker(intent, callbackId)
    }

    /**
     * NATIVE SHARE: Share text or links to other apps.
     */
    @JavascriptInterface
    fun shareText(text: String) {
        val sendIntent: android.content.Intent = android.content.Intent().apply {
            action = android.content.Intent.ACTION_SEND
            putExtra(android.content.Intent.EXTRA_TEXT, text)
            type = "text/plain"
        }
        val shareIntent = android.content.Intent.createChooser(sendIntent, null)
        context.startActivity(shareIntent)
    }

    /**
     * NATIVE TOAST: Show a quick message.
     */
    @JavascriptInterface
    fun showToast(message: String) {
        android.widget.Toast.makeText(context, message, android.widget.Toast.LENGTH_SHORT).show()
    }

    /**
     * UNIVERSAL UTILITY: Resolve an Android Scoped Storage URI into an absolute file path.
     * This copies the selected file into the app's cache directory so Python can read it
     * directly from the hard drive (bypassing Base64 JSON strings for massive files).
     */
    @JavascriptInterface
    fun cacheUriToFile(uriString: String, callbackId: String) {
        executor.execute {
            try {
                val uri = android.net.Uri.parse(uriString)
                val inputStream = context.contentResolver.openInputStream(uri)
                
                // Try to get original file name
                var fileName = "cached_file_" + System.currentTimeMillis()
                context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                    if (cursor.moveToFirst()) {
                        val nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                        if (nameIndex != -1) {
                            fileName = cursor.getString(nameIndex)
                        }
                    }
                }
                
                val tempFile = java.io.File(context.cacheDir, fileName)
                tempFile.outputStream().use { out ->
                    inputStream?.copyTo(out)
                }
                
                // Escape path for JSON
                val escapedPath = escapeJson(tempFile.absolutePath)
                val escapedName = escapeJson(fileName)
                sendResultToJs(callbackId, """{"success":true,"path":"$escapedPath","uri":"$uriString","name":"$escapedName"}""")
            } catch (e: Exception) {
                Log.e(TAG, "Cache error", e)
                val errorMsg = escapeJson(e.message ?: "Unknown error")
                sendResultToJs(callbackId, """{"success":false,"error":"Failed to cache file: $errorMsg"}""")
            }
        }
    }

    /**
     * UNIVERSAL UTILITY: Convert any Android URI to Base64 for easy viewing in WebView.
     * This is the scalable way to handle images/files picked from the system.
     */
    @JavascriptInterface
    fun getBase64FromUri(uriString: String, callbackId: String) {
        executor.execute {
            try {
                val uri = android.net.Uri.parse(uriString)
                // Open stream directly in decodeStream to avoid unused variable warning
                // val inputStream = context.contentResolver.openInputStream(uri)
                
                // --- SMART DOWNSCALING ---
                // Load dimensions first to avoid memory crash
                val options = android.graphics.BitmapFactory.Options().apply {
                    inJustDecodeBounds = true
                }
                android.graphics.BitmapFactory.decodeStream(context.contentResolver.openInputStream(uri), null, options)
                
                // Calculate scaling factor (Max 1024px for speed/memory)
                val maxDim = 1024
                var inSampleSize = 1
                if (options.outHeight > maxDim || options.outWidth > maxDim) {
                    val halfHeight = options.outHeight / 2
                    val halfWidth = options.outWidth / 2
                    while (halfHeight / inSampleSize >= maxDim && halfWidth / inSampleSize >= maxDim) {
                        inSampleSize *= 2
                    }
                }
                
                // Decode with scaling
                val decodeOptions = android.graphics.BitmapFactory.Options().apply {
                    inSampleSize = inSampleSize
                }
                val bitmap = android.graphics.BitmapFactory.decodeStream(context.contentResolver.openInputStream(uri), null, decodeOptions)
                
                // Compress to JPEG for smallest Base64 size
                val outputStream = java.io.ByteArrayOutputStream()
                bitmap?.compress(android.graphics.Bitmap.CompressFormat.JPEG, 80, outputStream)
                val bytes = outputStream.toByteArray()
                
                val base64 = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
                sendResultToJs(callbackId, """{"success":true,"base64":"data:image/jpeg;base64,$base64"}""")
            } catch (e: Exception) {
                Log.e(TAG, "Base64 conversion error", e)
                sendResultToJs(callbackId, """{"success":false,"error":"Failed to read file: ${e.message}"}""")
            }
        }
    }

    /**
     * Main IPC entry point. Called from JavaScript.
     *
     * @param method     Name of the Python function to call.
     * @param paramsJson JSON string of the parameters array.
     * @param callbackId Unique callback ID for resolving the JS Promise.
     */
    @JavascriptInterface
    fun call(method: String, paramsJson: String, callbackId: String) {
        // 🔒 P0 Security: Sanitize callbackId to prevent XSS injection
        val safeCallbackId = callbackId.replace(Regex("[^a-zA-Z0-9_]"), "")
        Log.d(TAG, "call: method='$method', params=$paramsJson, callback=$safeCallbackId")

        executor.execute {
            var resultJson: String
            try {
                // Call Python's dispatch_json(method, params_json)
                val pyResult: PyObject = apiModule.callAttr("dispatch_json", method, paramsJson)
                resultJson = pyResult.toString()
                Log.d(TAG, "Python result: ${resultJson.take(200)}")
            } catch (e: Exception) {
                Log.e(TAG, "Python execution error", e)
                // 🔒 P0 Security: Escape both error AND method to prevent JSON injection
                resultJson = """{"success":false,"error":"Android bridge error: ${escapeJson(e.message ?: "Unknown error")}","method":"${escapeJson(method)}"}"""
            }

            // Send result back to JavaScript on the UI thread
            sendResultToJs(safeCallbackId, resultJson)
        }
    }

    /**
     * Synchronous version for simple calls (e.g., ping).
     * Runs Python on the calling thread — use only for fast operations.
     */
    @JavascriptInterface
    fun callSync(method: String, paramsJson: String): String {
        Log.d(TAG, "callSync: method='$method', params=$paramsJson")
        return try {
            val pyResult: PyObject = apiModule.callAttr("dispatch_json", method, paramsJson)
            pyResult.toString()
        } catch (e: Exception) {
            Log.e(TAG, "callSync error", e)
            // 🔒 P0 Security: Escape method to prevent JSON injection
            """{"success":false,"error":"${escapeJson(e.message ?: "Unknown error")}","method":"${escapeJson(method)}"}"""
        }
    }

    /**
     * Send a result back to JavaScript by evaluating a callback function.
     */
    internal fun sendResultToJs(callbackId: String, resultJson: String) {
        // 🔒 P0 Security: Re-sanitize callbackId at the delivery point
        val safeId = callbackId.replace(Regex("[^a-zA-Z0-9_]"), "")

        // Escape the JSON for safe embedding in JavaScript string
        val escapedJson = resultJson
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
            .replace("\r", "\\r")

        // --- Universal Support for Python-only requests ---
        if (safeId == "internal_python_callback") {
            try {
                val py = Python.getInstance()
                val permModule = py.getModule("pywebapp.plugins.permissions")
                val isGranted = resultJson.contains("\"granted\":true")
                permModule.callAttr("_on_permission_result", isGranted)
                Log.d(TAG, "Sent permission result directly to Python handler")
                return
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send result back to Python plugin", e)
            }
        }

        val js = "window.__resolveCallback('$safeId', $resultJson)"
        val task = {
            val startTime = System.currentTimeMillis()
            webView.evaluateJavascript(js) { value ->
                val duration = System.currentTimeMillis() - startTime
                Log.d("PyWebApp.Bridge", "🌐 [JS-Update] Script executed in ${duration}ms for $safeId")
            }
        }

        if (android.os.Looper.myLooper() == android.os.Looper.getMainLooper()) {
            task()
        } else {
            mainHandler.post(task)
        }
    }

    /**
     * Escape special characters for safe JSON embedding.
     */
    private fun escapeJson(input: String): String {
        return input
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
    }
}
