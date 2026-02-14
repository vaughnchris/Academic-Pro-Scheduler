import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in the client-side code
      'process.env': env
    },
    server: {
      port: 8080,
      host: '0.0.0.0'
    },
    preview: {
      port: 8080,
      host: '0.0.0.0',
      allowedHosts: true
    }
  };
});