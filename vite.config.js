import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import HttpsCerts from 'vite-plugin-https-certs'

// import fs from 'fs'

// export default defineConfig({
//   plugins: [vue()],
//   server: {
//     https: {
//       key: fs.readFileSync('../../ssl/panicbot.xyz.key'),
//       cert: fs.readFileSync('../../ssl/panicbot_xyz.crt'),
//     },
//   },
//   define: {
//     'process.env': {}
//   }
// })

export default defineConfig({
  plugins: [vue(), HttpsCerts({
    path: '/home/lathan/ssl',
    certExts: ['.cert', '.cer', '.crt'],
    keyExts: ['.key'],
    defaultIfNoCerts: false,
  })] 
})

