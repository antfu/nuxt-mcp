import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

/**
 * Register Nuxt modules-related MCP tools
 */
export function registerNuxtModulesTools(server: McpServer): void {
  // Module list command - lists available modules for the add command
  server.tool(
    'get-nuxt-modules-list',
    'List all available Nuxt modules that can be added to your project using the \'add\' command. This provides a comprehensive list of official and community modules.',
    {
      version: z.enum(['3', '2-bridge', '2']).optional().describe('Nuxt version to filter modules by'),
      category: z.string().optional().describe('Category to filter modules by'),
    },
    async ({ version, category }) => {
      let url = 'https://api.nuxt.com/modules'
      const params = new URLSearchParams()

      if (version) {
        params.append('version', version)
      }
      if (category) {
        params.append('category', category)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
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
    },
  )

  // Module find command - finds a module by name
  server.tool(
    'find-nuxt-module',
    'Find a Nuxt module by name',
    {
      moduleName: z.string().describe('Name of the module to find'),
    },
    async ({ moduleName }) => {
      try {
        const response = await fetch(`https://api.nuxt.com/modules/${moduleName}`)
        const module = await response.json()

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(module, null, 2),
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
    },
  )

  // Get module categories command
  server.tool(
    'get-module-categories',
    'Get available Nuxt module categories',
    {
      version: z.enum(['3', '2-bridge', '2']).optional().describe('Nuxt version to filter categories by'),
    },
    async ({ version }) => {
      let url = 'https://api.nuxt.com/modules/categories'
      if (version) {
        url += `?version=${version}`
      }

      const response = await fetch(url)
      const data = await response.json()
      const categories = data.categories as string[]

      return {
        content: [
          {
            type: 'text',
            text: `Available module categories:\n\n- ${categories.join('\n- ')}`,
          },
        ],
      }
    },
  )
}
