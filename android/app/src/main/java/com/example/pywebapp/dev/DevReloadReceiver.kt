package com.example.pywebapp.dev

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.chaquo.python.Python

/**
 * DevReloadReceiver — BroadcastReceiver that triggers Python module reload.
 *
 * DEV MODE ONLY. Receives a broadcast from the dev_sync.py script on the
 * development machine after it pushes updated Python files via ADB.
 *
 * Flow:
 *   1. dev_sync.py detects file change on host machine
 *   2. Pushes updated .py files to /data/local/tmp/pywebapp/python/ via ADB
 *   3. Sends broadcast: adb shell am broadcast -a com.example.pywebapp.RELOAD_PYTHON
 *   4. This receiver triggers importlib.reload() on Python modules
 *   5. Updated functions are immediately available for IPC calls
 *
 * Security: Only registered in debug builds (see MainActivity).
 */
class DevReloadReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "DevReload"
        const val ACTION_RELOAD = "com.example.pywebapp.RELOAD_PYTHON"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_RELOAD) return

        Log.i(TAG, "🔄 Python reload signal received")

        try {
            val py = Python.getInstance()
            val reloadModule = py.getModule("importlib")

            // Reload in dependency order: logger → registry → handlers → api
            val modulesToReload = listOf("logger", "registry", "handlers", "api")

            for (moduleName in modulesToReload) {
                try {
                    val sysModule = py.getModule("sys")
                    val modules = sysModule["modules"]

                    // Check if module is loaded
                    val pyModule = modules?.callAttr("get", moduleName)
                    if (pyModule != null) {
                        reloadModule.callAttr("reload", pyModule)
                        Log.i(TAG, "  ✅ Reloaded: $moduleName")
                    } else {
                        Log.d(TAG, "  ⏭️ Module not loaded: $moduleName")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "  ❌ Failed to reload $moduleName: ${e.message}")
                }
            }

            Log.i(TAG, "🔄 Python reload complete")
        } catch (e: Exception) {
            Log.e(TAG, "Python reload failed", e)
        }
    }
}
