import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Phase 7: Optimized build config
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
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  // Phase 7.27: Build target es2020
  build: {
    target: 'es2020',
    // Phase 7.25: Vendor chunk splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Wave 5.2: Group route chunks to reduce waterfall
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'ui-vendor';
            if (id.includes('recharts') || id.includes('d3-')) return 'chart-vendor';
            if (id.includes('@tanstack')) return 'query-vendor';
            if (id.includes('framer-motion')) return 'animation-vendor';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'export-vendor';
            if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) return 'form-vendor';
          }
          // Group admin routes
          if (id.includes('/pages/admin/') || id.includes('/pages/Admin')) return 'admin-routes';
          // Group community routes
          if (id.includes('/pages/CommunitySolutions') || id.includes('/pages/CommunityPostDetail') || id.includes('/pages/DiabetesBurnout') || id.includes('/pages/FindDiabeticNearMe')) return 'community-routes';
        },
      },
    },
    // Phase 7.5: Bundle size optimization
    chunkSizeWarningLimit: 800,
  },
}));
