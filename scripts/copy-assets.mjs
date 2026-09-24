import fs from 'fs'
import path from 'path'

const src = process.cwd()
const dest = path.resolve(src, 'dist')

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath)
    } else if (entry.isFile()) {
      try {
        fs.writeFileSync(destPath, fs.readFileSync(srcPath))
      } catch (e) {
        console.error(`  FAILED: ${srcPath} -> ${destPath}: ${e.message}`)
      }
    }
  }
}

const dirs = [
  { from: 'js', to: 'js' },
  { from: 'img', to: 'img' },
  { from: 'ar/lib', to: 'ar/lib' },
  { from: 'ar/bot_core', to: 'ar/bot_core' },
  { from: 'en/lib', to: 'en/lib' },
  { from: 'en/bot_core', to: 'en/bot_core' },
]

for (const { from, to } of dirs) {
  const srcDir = path.resolve(src, from)
  const destDir = path.resolve(dest, to)
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, destDir)
  }
}
