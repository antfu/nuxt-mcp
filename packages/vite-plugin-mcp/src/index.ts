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
    printUrl = true,
    mcpServer = (vite: ViteDevServer) => import('./server').then(m => m.createMcpServerDefault(options, vite)),
  } = options

  const mcpRoute = options.mcpRouteRoot ?? options.mcpPath ?? '/__mcp'

  return {
    name: 'vite-plugin-mcp',
    async configureServer(vite) {
      let mcp = await mcpServer(vite)
      mcp = await options.mcpServerSetup?.(mcp, vite) || mcp
      await setupRoutes(mcpRoute, mcp, vite)

      const port = vite.config.server.port
      const root = searchForWorkspaceRoot(vite.config.root)

      const protocol = vite.config.server.https ? 'https' : 'http'
      const sseUrl = `${protocol}://${options.host || 'localhost'}:${options.port || port}${mcpRoute}/sse`

      await updateConfigs(root, sseUrl, options)

      if (printUrl) {
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log(`${c.yellow.bold`  ➜  MCP:     `}Server is running at ${sseUrl}`)
        }, 300)
      }
    },
  }
}

async function updateConfigs(root: string, sseUrl: string, options: ViteMcpOptions): Promise<void> {
  const {
    updateConfig = 'auto',
    updateConfigServerName = 'vite',
  } = options

  if (updateConfig === false)
    return

  const configs = updateConfig === 'auto'
    ? [
        existsSync(join(root, '.cursor')) ? 'cursor' as const : null,
        existsSync(join(root, '.vscode')) ? 'vscode' as const : null,
        existsSync(join(homedir(), '.codeium', 'windsurf')) ? 'windsurf' as const : null,
      ].filter(x => x !== null)
    : Array.isArray(updateConfig)
      ? updateConfig
      : []

  // Cursor
  if (configs.includes('cursor')) {
    await fs.mkdir(join(root, '.cursor'), { recursive: true })
    const mcp = existsSync(join(root, '.cursor/mcp.json'))
      ? JSON.parse(await fs.readFile(join(root, '.cursor/mcp.json'), 'utf-8') || '{}')
      : {}
    mcp.mcpServers ||= {}
    mcp.mcpServers[updateConfigServerName || 'vite'] = { url: sseUrl }
    await fs.writeFile(join(root, '.cursor/mcp.json'), `${JSON.stringify(mcp, null, 2)}\n`)
  }

  // VSCode
  if (configs.includes('vscode')) {
    await fs.mkdir(join(root, '.vscode'), { recursive: true })
    const mcp = existsSync(join(root, '.vscode/mcp.json'))
      ? JSON.parse(await fs.readFile(join(root, '.vscode/mcp.json'), 'utf-8') || '{}')
      : {}
    mcp.servers ||= {}
    mcp.servers[updateConfigServerName || 'vite'] = {
      type: 'sse',
      url: sseUrl,
    }
    await fs.writeFile(join(root, '.vscode/mcp.json'), `${JSON.stringify(mcp, null, 2)}\n`)
  }

  // Windsurf
  if (configs.includes('windsurf')) {
    const windsurfDir = join(homedir(), '.codeium', 'windsurf')
    const windsurfConfigPath = join(windsurfDir, 'mcp_config.json')
    try {
      await fs.mkdir(windsurfDir, { recursive: true })
      const config = existsSync(windsurfConfigPath)
        ? JSON.parse(await fs.readFile(windsurfConfigPath, 'utf-8').catch(() => '{}') || '{}')
        : {}
      config.mcpServers ||= {}
      config.mcpServers[updateConfigServerName || 'vite'] = { url: sseUrl }
      await fs.writeFile(windsurfConfigPath, `${JSON.stringify(config, null, 2)}\n`)
    }
    catch (e) {
      console.error(`${c.red.bold('  ➜  MCP (Windsurf): ')}Failed to update ${windsurfConfigPath}`, e)
    }
  }
}
