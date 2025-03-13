import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Component, NuxtOptions } from '@nuxt/schema'
import type { Unimport } from 'unimport'

/**
 * Register Nuxt-specific MCP tools
 */
export function registerNuxtRuntimeTools(
  mcp: McpServer,
  nuxt: { options: NuxtOptions },
  unimport: Unimport,
  components: Component[],
): void {
  mcp.tool(
    'get-nuxt-config',
    'Get the Nuxt configuration, including the ssr, appDir, srcDir, rootDir, alias, runtimeConfig, modules, etc.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ssr: !!nuxt.options.ssr,
            appDir: nuxt.options.appDir,
            srcDir: nuxt.options.srcDir,
            rootDir: nuxt.options.rootDir,
            alias: nuxt.options.alias,
            runtimeConfig: {
              public: nuxt.options.runtimeConfig.public,
            },
            modules: nuxt.options._installedModules.map(i => i.meta.name || (i as any).name).filter(Boolean),
            imports: {
              autoImport: !!nuxt.options.imports.autoImport,
              ...nuxt.options.imports,
            },
            components: nuxt.options.components,
          }),
        }],
      }
    },
  )

  mcp.tool(
    'get-nuxt-auto-imports-items',
    'Get auto-imports items, when adding new functions to the code, check available items from this tool.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            items: await unimport.getImports(),
          }, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'get-nuxt-components',
    'Get components registered in the Nuxt app. When adding new components, check available components from this tool.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(components, null, 2),
        }],
      }
    },
  )
}
