import type { Plugin, ViteDevServer } from 'vite'
import type { ViteMcpOptions } from './types'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { join } from 'pathe'
import { searchForWorkspaceRoot } from 'vite'
import { setupRoutes } from './connect'

export function ViteMcp(options: ViteMcpOptions = {}): Plugin {
  const {
    mcpPath = '/__mcp',
    updateCursorMcpJson = true,
    mcpServer = (vite: ViteDevServer) => import('./server').then(m => m.createMcpServerDefault(options, vite)),
  } = options

  const cursorMcpOptions = typeof updateCursorMcpJson == 'boolean'
    ? { enabled: updateCursorMcpJson }
    : updateCursorMcpJson

  return {
    name: 'vite-plugin-mcp',
    async configureServer(vite) {
      let mcp = await mcpServer(vite)
      mcp = await options.mcpServerSetup?.(mcp, vite) || mcp
      await setupRoutes(mcpPath, mcp, vite)

      const port = vite.config.server.port
      const root = searchForWorkspaceRoot(vite.config.root)

      if (cursorMcpOptions.enabled) {
        if (existsSync(join(root, '.cursor'))) {
          const mcp = existsSync(join(root, '.cursor/mcp.json'))
            ? JSON.parse(await fs.readFile(join(root, '.cursor/mcp.json'), 'utf-8'))
            : {}
          mcp.mcpServers ||= {}
          mcp.mcpServers[cursorMcpOptions.serverName || 'vite'] = {
            url: `http://${options.host || 'localhost'}:${options.port || port}${mcpPath}/sse`,
          }
          await fs.writeFile(join(root, '.cursor/mcp.json'), `${JSON.stringify(mcp, null, 2)}\n`)
        }
      }
    },
  }
}
