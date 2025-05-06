import type { Plugin, ViteDevServer } from 'vite'
import type { ViteMcpOptions } from './types'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import { homedir } from 'node:os'
import c from 'ansis'
import { join } from 'pathe'
import { searchForWorkspaceRoot } from 'vite'
import { setupRoutes } from './connect'

export * from './types'

export function ViteMcp(options: ViteMcpOptions = {}): Plugin {
  const {
    mcpPath = '/__mcp',
    updateCursorMcpJson = true,
    updateVSCodeMcpJson = true,
    updateWindsurfMcpJson = true,
    printUrl = true,
    mcpServer = (vite: ViteDevServer) => import('./server').then(m => m.createMcpServerDefault(options, vite)),
  } = options

  const cursorMcpOptions = typeof updateCursorMcpJson == 'boolean'
    ? { enabled: updateCursorMcpJson }
    : updateCursorMcpJson

  const vscodeMcpOptions = typeof updateVSCodeMcpJson == 'boolean'
    ? { enabled: updateVSCodeMcpJson }
    : updateVSCodeMcpJson

  const windsurfMcpOptions = typeof updateWindsurfMcpJson === 'boolean'
    ? { enabled: updateWindsurfMcpJson }
    : updateWindsurfMcpJson

  return {
    name: 'vite-plugin-mcp',
    async configureServer(vite) {
      let mcp = await mcpServer(vite)
      mcp = await options.mcpServerSetup?.(mcp, vite) || mcp
      await setupRoutes(mcpPath, mcp, vite)

      const port = vite.config.server.port
      const root = searchForWorkspaceRoot(vite.config.root)

      const protocol = vite.config.server.https ? 'https' : 'http'
      const sseUrl = `${protocol}://${options.host || 'localhost'}:${options.port || port}${mcpPath}/sse`

      if (cursorMcpOptions.enabled) {
        if (existsSync(join(root, '.cursor'))) {
          const mcp = existsSync(join(root, '.cursor/mcp.json'))
            ? JSON.parse(await fs.readFile(join(root, '.cursor/mcp.json'), 'utf-8') || '{}')
            : {}
          mcp.mcpServers ||= {}
          mcp.mcpServers[cursorMcpOptions.serverName || 'vite'] = { url: sseUrl }
          await fs.writeFile(join(root, '.cursor/mcp.json'), `${JSON.stringify(mcp, null, 2)}\n`)
        }
      }

      if (vscodeMcpOptions.enabled) {
        const vscodeConfig = join(root, '.vscode/settings.json')
        if (existsSync(vscodeConfig)) {
          const mcp = existsSync(join(root, '.vscode/mcp.json'))
            ? JSON.parse(await fs.readFile(join(root, '.vscode/mcp.json'), 'utf-8') || '{}')
            : {}
          mcp.servers ||= {}
          mcp.servers[vscodeMcpOptions.serverName || 'vite'] = {
            type: 'sse',
            url: sseUrl,
          }
          await fs.writeFile(join(root, '.vscode/mcp.json'), `${JSON.stringify(mcp, null, 2)}\n`)
        }
      }

      if (windsurfMcpOptions.enabled) {
        const windsurfDir = join(homedir(), '.codeium', 'windsurf')
        const windsurfConfigPath = join(windsurfDir, 'mcp_config.json')
        try {
          if (!existsSync(windsurfDir)) {
            await fs.mkdir(windsurfDir, { recursive: true })
          }
          const config = existsSync(windsurfConfigPath)
            ? JSON.parse(await fs.readFile(windsurfConfigPath, 'utf-8').catch(() => '{}') || '{}')
            : {}
          config.mcpServers ||= {}
          config.mcpServers[windsurfMcpOptions.serverName || 'vite'] = { url: sseUrl }
          await fs.writeFile(windsurfConfigPath, `${JSON.stringify(config, null, 2)}\n`)
        }
        catch (e) {
          console.error(`${c.red.bold('  ➜  MCP (Windsurf): ')}Failed to update ${windsurfConfigPath}`, e)
        }
      }

      if (printUrl) {
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log(`${c.yellow.bold`  ➜  MCP:     `}Server is running at ${sseUrl}`)
        }, 300)
      }
    },
  }
}
