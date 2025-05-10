import type { Nitro } from 'nitropack'
import type { Unimport } from 'unimport'
import type { ViteMcpOptions } from 'vite-plugin-mcp'
import type { McpToolContext } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { ViteMcp } from 'vite-plugin-mcp'
import { promptNuxtBasic } from './prompts/basic'
import { toolsNuxtDotComInfo } from './tools/nuxt-dot-com'
import { toolsNuxtRuntime } from './tools/runtime'
import { toolsScaffold } from './tools/scaffold'

export interface ModuleOptions extends ViteMcpOptions {
}

export interface ModuleHooks {
  'mcp:setup': (context: McpToolContext) => void
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mcp',
    configKey: 'mcp',
  },
  defaults: {},
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
      updateConfigServerName: 'nuxt-local',
      ...options,
      port: nuxt.options.devServer.port,
      async mcpServerSetup(mcp, vite) {
        await options.mcpServerSetup?.(mcp, vite)

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

declare module 'nuxt/schema' {
  interface NuxtHooks {
    'mcp:setup': (ctx: McpToolContext) => void | Promise<void>
  }
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'mcp:setup': (ctx: McpToolContext) => void | Promise<void>
  }
}
