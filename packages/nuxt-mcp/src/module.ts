import type { Component } from '@nuxt/schema'
import type { Unimport } from 'unimport'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { ViteMcp } from 'vite-plugin-mcp'
import { version } from '../package.json'
import { registerNuxtCliTools } from './tools/nuxt-cli'
import { registerNuxtModulesTools } from './tools/nuxt-modules'
import { registerNuxtRuntimeTools } from './tools/nuxt-runtime'

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

    const basePath = nuxt.options.rootDir

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
        // Register Nuxt-specific tools
        registerNuxtRuntimeTools(mcp, nuxt, unimport, components)

        // Register Nuxt modules-related tools
        registerNuxtModulesTools(mcp)

        // Register Nuxt CLI tools
        registerNuxtCliTools(mcp, basePath)
      },
    }), { client: true })
  },
})
