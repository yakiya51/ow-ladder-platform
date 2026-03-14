import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // any env variables starting with PUBLIC_ will be processed by vite
  envPrefix: "PUBLIC_",
  // read .env file from root of monorepo
  envDir: path.resolve(__dirname, "../server/"),
  // import aliasing (should match with tsconfig)
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
