import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Custom Vite Plugin to automatically route API requests to the Python backend
 * during 'pywebapp dev web' without cluttering the index.html file.
 */
const pyWebAppDevPlugin = () => {
  return {
    name: 'pywebapp-dev-injector',
    apply: 'serve', // Only runs during local development, stripped in production build
    transformIndexHtml(html) {
      // The PyWebApp CLI automatically passes this environment variable in Web Dev mode
      const port = process.env.PYWEBAPP_API_PORT;
      if (port) {
        return html.replace(
          '<head>',
          `<head>\n    <script>window.__PYWEBAPP_API_URL__ = 'http://127.0.0.1:${port}/api/dispatch';</script>`
        );
      }
      return html;
    }
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    pyWebAppDevPlugin(),
  ],

  // CRITICAL: Use relative paths so WebView can load from file:// protocol
  base: './',

  build: {
    outDir: 'dist',
    // Generate sourcemaps for debugging in WebView
    sourcemap: false,
    // Ensure compatibility with older WebView engines
    target: 'es2015',
    rollupOptions: {
      output: {
        // Keep filenames predictable for WebView caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  server: {
    // Dev server config (used during development only)
    port: 5173,
    open: false,
    // Bind to all interfaces so Android emulators, physical devices,
    // and ADB reverse tunnels can all reach the server reliably.
    host: true,
    // Vite v6+ strict host checking drops requests from unknown origins.
    // 'all' ensures no silent ERR_EMPTY_RESPONSE failures.
    allowedHosts: 'all',
  },
});
