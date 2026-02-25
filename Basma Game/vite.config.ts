import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import checker from "vite-plugin-checker";
import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

// https://vite.dev/config/
export default defineConfig({
  // CRITICAL: Forces relative paths (./) instead of absolute paths (/)
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    checker({
      typescript: true,
    }),
  ],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensures the output goes to 'dist' which Electron expects
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    // Prevents issues with large assets in Electron
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Standardizes naming to ensure Electron can always map the files
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});