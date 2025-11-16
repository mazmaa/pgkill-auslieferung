import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Configure for GitHub Pages deployment
  base: '/pgkill-auslieferung/',
  // server: {
  //   open: "/src/index.html"
  // },
  assetsInclude: ["**/*.onnx"],
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
  build: {
    // Ensure ONNX files are included in build
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Preserve ONNX file as separate asset
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.onnx')) {
            return 'assets/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
})
