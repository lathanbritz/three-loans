import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

// https://vitejs.dev/config/
const config = (import.meta.env.NODE_ENV === 'production') ? {
  plugins: [vue()],
  server: {
    https: {
      key: fs.readFileSync('../../ssl/panicbot.xyz.key'),
      cert: fs.readFileSync('../../ssl/panicbot_xyz.crt'),
    },
  },
} : { plugins: [vue()] }

export default defineConfig(config)
