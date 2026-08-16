import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const serverPort = env.VITE_SERVER_PORT || '3001'

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    css: {
      // Disable PostCSS entirely — Tailwind v4 is handled via the plugin above
      postcss: {
        plugins: [],
      },
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
