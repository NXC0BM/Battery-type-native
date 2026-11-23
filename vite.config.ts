import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Типы аккумуляторов",
        short_name: "battery_type",
        theme_color: "#fc8507",
        background_color: "#eeeeee",
        display: "standalone",
        icons: [
          {
            src: "battery-type-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,svg,jpg,png}"],
      },
    }),
  ],
  server: {
    port: 53001,
    host: true,
    proxy: { "/api": { target: "http://127.0.0.1:53000", changeOrigin: true } },
  },
  worker: { format: "es" },
});
