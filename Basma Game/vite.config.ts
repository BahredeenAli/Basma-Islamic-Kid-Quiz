import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import checker from "vite-plugin-checker";
import dns from "node:dns";

dns.setDefaultResultOrder("verbatim");

// https://vite.dev/config/
export default defineConfig({
  // CRITICAL: Forces relative paths so Electron can find assets on the local drive
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
    // Ensures the build is output to the 'dist' folder Electron is looking for
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    // Helps Electron handle the JavaScript modules correctly
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        // Keeps file names predictable
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});