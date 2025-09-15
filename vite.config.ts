import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all addresses
    allowedHosts: ["43cqgx-5173.csb.app"], // allow all hosts (or list specific ones)
    strictPort: true,
    port: 5173,
  },
});
