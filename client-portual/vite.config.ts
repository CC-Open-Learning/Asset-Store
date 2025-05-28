import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.PNG"],
  plugins: [react()],
  base: "/",
  build: {
    outDir: "./dist",
    target: ["chrome90", "edge90", "es2022", "firefox89", "safari15"]
  }
});
