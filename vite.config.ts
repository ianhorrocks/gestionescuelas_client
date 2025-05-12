// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escucha en 0.0.0.0 y desactiva el host‐check por defecto
    // explícitamente permite tu subdominio de ngrok:
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "c9fe-190-19-158-205.ngrok-free.app",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
