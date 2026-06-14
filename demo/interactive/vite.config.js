import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// `base: './'` keeps asset URLs relative so the demo works when served
// from the `/isect/` subpath on GitHub Pages (was `baseUrl: ''` under vue-cli).
export default defineConfig({
  base: './',
  plugins: [vue()]
});
