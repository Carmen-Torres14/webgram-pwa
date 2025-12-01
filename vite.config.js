import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    https: false, // ➜ solo para desarrollo
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
