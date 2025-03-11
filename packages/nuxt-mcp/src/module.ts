import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { ViteMcp } from 'vite-plugin-mcp'
import { version } from '../package.json'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mcp',
    configKey: 'mcp',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, nuxt) {
    addVitePlugin(ViteMcp({
      mcpServerInfo: {
        name: 'nuxt',
        version,
      },
      mcpServerSetup(server) {
        server.resource(
          'nuxt',
          new ResourceTemplate('nuxt://{name}', { list: undefined }),
          async (uri, { name }) => {
            return {
              contents: [{ uri: uri.href, text: `Hello, ${name}!` }],
            }
          },
        )
      },
      port: nuxt.options.devServer.port,
      updateCursorMcpJson: {
        enabled: true,
        serverName: 'nuxt',
      },
    }))
  },
})
