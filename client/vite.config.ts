import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

// Get build info
const getBuildInfo = () => {
  try {
    const gitHash = execSync('git rev-parse --short=8 HEAD', { encoding: 'utf8' }).trim()
    const buildDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    return { gitHash, buildDate }
  } catch {
    // Fallback for environments without git
    return { 
      gitHash: 'unknown', 
      buildDate: new Date().toISOString().split('T')[0] 
    }
  }
}

const { gitHash, buildDate } = getBuildInfo()

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3000'

  return {
    root: __dirname,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      watch: {
        ignored: ['**/data/**', '**/demo/**', '**/scripts/**', '**/server/**']
      },
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''), // Strip /api prefix before forwarding to backend
        }
      }
    },
    define: {
      'import.meta.env.VITE_BUILD_DATE': JSON.stringify(buildDate),
      'import.meta.env.VITE_GIT_HASH': JSON.stringify(gitHash),
    },
  }
})
