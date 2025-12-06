import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // Node.js의 path 모듈 사용
import glsl from "vite-plugin-glsl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  resolve: {
    alias: {
      // tsconfig.json의 paths와 동일하게 설정
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
});
