import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    port: 53001,
    host: true,
    proxy: { "/api": { target: "http://127.0.0.1:53000", changeOrigin: true } },
  },
  worker: { format: "es" },
});
