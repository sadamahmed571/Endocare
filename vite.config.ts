import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

const htmlDirs = ['.', 'ar', 'en', 'sys_log_metrics']
const input = {}
htmlDirs.forEach(dir => {
  const fullDir = resolve(dir)
  if (!fs.existsSync(fullDir)) return
  const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'))
  files.forEach(f => {
    const key = dir === '.' ? f.replace(/\.html$/, '') : dir + '/' + f.replace(/\.html$/, '')
    input[key] = resolve(dir, f)
  })
})

export default defineConfig({
  server: { port: 3000, host: '0.0.0.0' },
  envPrefix: ['VITE_', 'GEMINI_'],
  build: {
    outDir: 'dist',
    rollupOptions: { input },
  },
})
