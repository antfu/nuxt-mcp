import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { McpToolContext } from '../types'
import { createCache } from 'async-cache-dedupe'
import { z } from 'zod'

export function toolsNuxtDotComInfo({ mcp, nuxt }: McpToolContext): void {
  const cache = createCache({
    ttl: 60 * 60 * 3, // 3 hours
    stale: 60 * 60 * 3, // 3 hours
    storage: { type: 'memory' },
  })

  const listRemoteNuxtModules = cache.define('list-remote-nuxt-modules', async (): Promise<CallToolResult> => {
    const response = await fetch('https://api.nuxt.com/modules?version=3')
    const data = await response.json()
    const modules = data.modules.map((module: { name: string }) => module.name)
    const modulesList = modules.join('\n- ')

    return {
      content: [
        {
          type: 'text',
          text: `Available Nuxt modules:\n\n${modulesList}`,
        },
      ],
    }
  })

  const getNuxtModuleInfo = cache.define('get-nuxt-module-info', async (moduleName: string): Promise<CallToolResult> => {
    try {
      const response = await fetch(`https://api.nuxt.com/modules/${moduleName}`)
      const module = await response.json()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              nuxtRoot: nuxt.options.rootDir,
              nuxtSrcDir: nuxt.options.srcDir,
              module,
            }, null, 2),
          },
        ],
      }
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (_) {
      return {
        content: [
          { type: 'text', text: `Module ${moduleName} not found` },
        ],
      }
    }
  })

  // Module list command - lists available modules for the add command
  mcp.tool(
    'list-remote-nuxt-modules',
    'List all available Nuxt modules that can be added to your project using the \'nuxi module add {module-name}\' command. This provides a comprehensive list of official and community modules.',
    {},
    async () => {
      return await listRemoteNuxtModules['list-remote-nuxt-modules']()
    },
  )

  // Module find command - finds a module by name
  mcp.tool(
    'get-nuxt-module-info',
    'Get information about a Nuxt module by name',
    {
      moduleName: z.string().describe('Name of the module to get info about'),
    },
    async ({ moduleName }) => {
      return await getNuxtModuleInfo['get-nuxt-module-info'](moduleName)
    },
  )
}
