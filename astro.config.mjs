// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  site: 'https://cinepose.vercel.app',
  integrations: [react()],
  output: 'server',
  adapter: vercel({
    maxDuration: 30,
    webAnalytics: {
      enabled: false,
    },
    imageService: true,
  }),
  server: {
    host: true,
  },
  vite: {
    plugins: [tailwindcss(), basicSsl()],
    ssr: {
      noExternal: ['@react-three/fiber', '@react-three/drei', 'three', 'framer-motion', 'zustand'],
    },
    server: {
      watch: {
        ignored: ['**/dist/**', '**/.vercel/**'],
      },
    },
  },
});
