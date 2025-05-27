// app/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import VitePWA

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Simp - Time management app',
        short_name: 'simp',
        description: 'An MVP for managing your schedule and tasks.',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png', // Relative to the `public` folder
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ]
      },
      // You can add more workbox configuration here if needed for advanced caching
    })
  ],
  server: {
    port: 3000, // Or your preferred development port
    proxy: {
      '/api': { // Any request starting with /api
        target: 'http://localhost:3001', // Will be forwarded to your backend running on port 3001 (based on your .env)
        changeOrigin: true, // Necessary for virtual hosted sites
        secure: false, // For development, allow self-signed certs (if any)
        rewrite: (path) => path.replace(/^\/api/, ''), // <<< ADD THIS LINE
      },
    },
  },
});