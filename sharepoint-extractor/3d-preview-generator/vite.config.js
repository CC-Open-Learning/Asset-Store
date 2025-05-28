import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ["three", "@react-three/fiber"]
    },
    server: {
      // Use the loaded env variable
      port: env.VITE_PGEN_PORT || 4000
    }
  };
});
