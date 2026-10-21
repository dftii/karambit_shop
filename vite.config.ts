import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Vendors estables en chunks propios: cachean entre despliegues y el chunk de entrada queda pequeño.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/, priority: 30 },
            { name: 'vendor-motion', test: /node_modules[\/](framer-motion|motion-dom|motion-utils)[\/]/, priority: 20 },
            { name: 'vendor-icons', test: /node_modules[\/]lucide-react[\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/.temp_chrome/**', '**/scratch/**', '**/.git/**']
    }
  }
})
