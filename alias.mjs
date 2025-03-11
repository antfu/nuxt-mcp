import { fileURLToPath } from 'node:url'

const r = path => fileURLToPath(new URL(path, import.meta.url))

export default {
  'vite-plugin-mcp': r('./packages/vite-plugin-mcp/src/index.ts'),
}
