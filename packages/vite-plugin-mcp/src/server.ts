import type { ViteDevServer } from 'vite'
import type { ViteMcpOptions } from './types'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { version } from '../package.json'

export function createMcpServerDefault(
  options: ViteMcpOptions,
  vite: ViteDevServer,
): McpServer {
  const server = new McpServer(
    {
      name: 'vite',
      version,
      ...options.mcpServerInfo,
    },
  )

  server.tool(
    'get-vite-config',
    'Get the Vite configuration. This is the full Vite configuration object.',
    {},
    async () => ({
      content: [{
        type: 'text',
        text: JSON.stringify({
          root: vite.config.root,
          resolve: vite.config.resolve,
          plugins: vite.config.plugins.map(p => p.name).filter(Boolean),
          environmentNames: Object.keys(vite.environments),
        }),
      }],
    }),
  )

  server.tool(
    'get-vite-module-info',
    'Get information about a specific module given a absolute filepath',
    {
      filepath: z.string(),
    },
    async ({ filepath }) => {
      const records: any[] = []
      Object.entries(vite.environments).forEach(([key, env]) => {
        const mods = env.moduleGraph.getModulesByFile(filepath)
        for (const mod of mods || []) {
          records.push({
            environment: key,
            id: mod.id,
            url: mod.url,
            importers: Array.from(mod.importers),
            importedModules: Array.from(mod.importedModules),
            meta: mod.meta,
            lastHMRTimestamp: mod.lastHMRTimestamp,
            transformResult: mod.transformResult,
          })
        }
      })
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(records),
        }],
      }
    },
  )

  return server
}
