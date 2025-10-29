import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '127.0.0.1', // Hardened: Bind to 127.0.0.1 by default
      },
      plugins: [react()],
      define: {
        // P0-1: Removed GEMINI_API_KEY. Do not inline secrets into client builds.
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        // P2-2: Expose the non-sensitive demo mode flag
        'process.env.VITE_DEMO_MODE': JSON.stringify(env.VITE_DEMO_MODE),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});