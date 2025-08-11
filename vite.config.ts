import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const reactPath = path.dirname(require.resolve("react/package.json"));
const reactDomPath = path.dirname(require.resolve("react-dom/package.json"));
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: reactPath,
      "react/jsx-runtime": path.join(reactPath, "jsx-runtime.js"),
      "react-dom": reactDomPath,
      "react-dom/client": path.join(reactDomPath, "client.js"),
    },
    dedupe: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
  },
}));
