import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false,
    hmr: {
      overlay: false
    }
  },
  build: {
    target: "es2015",
    minify: false
  },
  clearScreen: false,
  optimizeDeps: {
    exclude: ['@vite/client', '@vite/env']
  }
});
