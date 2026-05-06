import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.chaquo.python")
}

// ─── Keystore Configuration ─────────────────────────────────────
// Load signing config from keystore.properties (not committed to git).
// Create android/keystore.properties with:
//   storeFile=path/to/your.keystore
//   storePassword=your_store_password
//   keyAlias=your_key_alias
//   keyPassword=your_key_password
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    namespace = "com.example.pywebapp"
    compileSdk = 34

    buildFeatures {
        buildConfig = true
    }

    defaultConfig {
        applicationId = "com.example.pywebapp"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // Chaquopy: specify which ABIs to build for
        ndk {
            abiFilters += listOf("arm64-v8a", "x86_64")
        }
    }

    // ─── Signing Configs ────────────────────────────────────────
    signingConfigs {
        // Debug signing (auto-generated, used for development)
        getByName("debug") {
            // Uses default debug keystore
        }

        // Release signing (loaded from keystore.properties)
        create("release") {
            if (keystorePropertiesFile.exists()) {
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
            }
        }
    }

    buildTypes {
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }

        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Use release signing config if keystore is available
            if (keystorePropertiesFile.exists()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }
}

// Chaquopy: Python configuration (New 15.0+ DSL)
chaquopy {
    defaultConfig {
        // version = "3.10"
        // pip {
        //     install("numpy")
        // }
    }
    sourceSets {
        getByName("main") {
            setSrcDirs(listOf("src/main/python"))
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.webkit:webkit:1.9.0")
    implementation("com.google.code.gson:gson:2.10.1")
}
