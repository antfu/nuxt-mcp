import type { Nitro } from 'nitropack'
import type { Unimport } from 'unimport'
import type { McpToolContext } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { ViteMcp } from 'vite-plugin-mcp'
import { version } from '../package.json'
import { promptNuxtBasic } from './prompts/basic'
import { toolsNuxtDotComInfo } from './tools/nuxt-dot-com'
import { toolsNuxtRuntime } from './tools/runtime'
import { toolsScaffold } from './tools/scaffold'

export interface ModuleOptions {
  /**
   * Update MCP url to `.cursor/mcp.json` automatically
   *
   * @default true
   */
  updateCursorMcpJson?: boolean
  /**
   * Update MCP url to `.vscode/mcp.json` automatically
   *
   * @default true
   */
  updateVSCodeMcpJson?: boolean
}

export interface ModuleHooks {
  'mcp:setup': (context: McpToolContext) => void
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mcp',
    configKey: 'mcp',
  },
  defaults: {
    updateCursorMcpJson: true,
    updateVSCodeMcpJson: true,
  },
  async setup(options, nuxt) {
    const unimport = promiseWithResolve<Unimport>()
    const nitro = promiseWithResolve<Nitro>()

    nuxt.hook('imports:context', (_unimport) => {
      unimport.resolve(_unimport)
    })
    nuxt.hook('nitro:init', (_nitro) => {
      nitro.resolve(_nitro)
    })

    addVitePlugin(ViteMcp({
      port: nuxt.options.devServer.port,
      updateCursorMcpJson: {
        enabled: !!options.updateCursorMcpJson,
        serverName: 'nuxt',
      },
      updateVSCodeMcpJson: {
        enabled: !!options.updateVSCodeMcpJson,
        serverName: 'nuxt',
      },
      mcpServerInfo: {
        name: 'nuxt',
        version,
      },
      async mcpServerSetup(mcp, vite) {
        const context: McpToolContext = {
          unimport: unimport.promise,
          nitro: nitro.promise,
          nuxt,
          vite,
          mcp,
        }

        promptNuxtBasic(context)
        toolsNuxtRuntime(context)
        toolsNuxtDotComInfo(context)
        toolsScaffold(context)

        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore skip type infer
        await nuxt.callHook('mcp:setup', context)
      },
    }), { client: true })
  },
})

function promiseWithResolve<T>(): { promise: Promise<T>, resolve: (value: T) => void } {
  let resolve: (value: T) => void = undefined!
  const promise = new Promise<T>((_resolve) => {
    resolve = _resolve
  })
  return { promise, resolve }
}
