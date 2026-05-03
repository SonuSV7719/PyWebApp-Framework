import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],

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
  },
});
