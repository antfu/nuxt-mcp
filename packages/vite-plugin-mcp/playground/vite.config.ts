import { defineConfig } from 'vite'
import { ViteMcp } from '../src'

export default defineConfig({
  plugins: [
    ViteMcp(),
  ],
  server: {
    port: 5200,
  },
})
