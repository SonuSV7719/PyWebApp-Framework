# PyWebApp ProGuard Rules

# 1. Keep Chaquopy and Python internal classes
-keep class com.chaquo.python.** { *; }
-dontwarn com.chaquo.python.**

# 2. Keep our Native Bridge methods (very important for IPC)
-keepclassmembers class com.example.pywebapp.PythonBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# 3. Keep Android WebView support classes
-keep class androidx.webkit.** { *; }
-dontwarn androidx.webkit.**

# 4. Standard optimization settings
-optimizationpasses 5
-allowaccessmodification
-mergeinterfacesaggressively
-repackageclasses ''
