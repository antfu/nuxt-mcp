import type { Component } from '@nuxt/schema'
import type { Unimport } from 'unimport'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { ViteMcp } from 'vite-plugin-mcp'
import { version } from '../package.json'

export interface ModuleOptions {
  /**
   * Update MCP url to `.cursor/mcp.json` automatically
   *
   * @default true
   */
  updateCursorMcpJson?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mcp',
    configKey: 'mcp',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    updateCursorMcpJson: true,
  },
  async setup(options, nuxt) {
    let unimport: Unimport
    let components: Component[] = []
    nuxt.hook('imports:context', (_unimport) => {
      unimport = _unimport
    })
    nuxt.hook('components:extend', (_components) => {
      components = _components
    })

    addVitePlugin(ViteMcp({
      port: nuxt.options.devServer.port,
      updateCursorMcpJson: {
        enabled: !!options.updateCursorMcpJson,
        serverName: 'nuxt',
      },
      mcpServerInfo: {
        name: 'nuxt',
        version,
      },
      mcpServerSetup(mcp) {
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
                }),
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
                text: JSON.stringify(components),
              }],
            }
          },
        )
      },
    }))
  },
})
