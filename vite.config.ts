import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const base = process.env.VERCEL ? "/" : process.env.GITHUB_ACTIONS ? "/kadha-sarees-/" : "/";

export default defineConfig({
  base: base,
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    watch: {
      ignored: ["**/public/**"],
    },
  },
});
