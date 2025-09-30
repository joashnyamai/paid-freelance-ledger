import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Make env variables available to the client
    define: {
      'process.env': {}
    },
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      open: true,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Explicitly define which env variables should be exposed to the client
    // Only variables prefixed with VITE_ will be exposed
    envPrefix: 'VITE_',
    build: {
      target: 'esnext',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
    },
  },
}));
