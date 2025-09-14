import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    // Base path cho mọi route
  base: '/',

  // Cấu hình server dev
  server: {
    port: 5176, // Cổng mặc định
    host: 'localhost', // Hostname
    strictPort: true,
    open: true, // Tự động mở trình duyệt
    // Bắt buộc cho React Router
    historyApiFallback: {
      rewrites: [
        { from: /./, to: '/index.html' } // Fallback mọi route
      ]
    }
  },

  // Tối ưu preload (optional)
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }

})
