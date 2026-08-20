import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      includePublic: true,
      logStats: true,
      png: {
        // Use the largest indexed palette and maximum encoder quality, spending
        // more build time on smaller files. Only dist is modified.
        quality: 100,
        compressionLevel: 9,
        effort: 10,
        palette: true,
      },
      jpeg: {
        quality: 92,
        progressive: true,
        mozjpeg: true,
      },
      jpg: {
        quality: 92,
        progressive: true,
        mozjpeg: true,
      },
      webp: {
        quality: 92,
        alphaQuality: 100,
        smartSubsample: true,
        effort: 6,
      },
    }),
  ],
});
