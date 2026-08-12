import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages–compatible relative base so assets work under
// https://USERNAME.github.io/REPOSITORY_NAME/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
