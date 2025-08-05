import type { Nitro } from 'nitropack'
import type { Unimport } from 'unimport'
import type { ViteMcpOptions } from 'vite-plugin-mcp'
import type { McpToolContext } from './types'
import { addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import { ViteMcp } from 'vite-plugin-mcp'
import { promptNuxtBasic } from './prompts/basic'
import { promptNuxtUI } from './prompts/ui'
import { promptNuxtAuth } from './prompts/auth'
import { promptDatabase } from './prompts/database'
import { promptFullstack } from './prompts/fullstack'
import { promptDesignExpert } from './prompts/design-expert'
import { promptAccessibilityExpert } from './prompts/accessibility-expert'
import { toolsNuxtRuntime } from './tools/runtime'
import { toolsScaffold } from './tools/scaffold'
import { toolsNuxtUI } from './tools/ui'
import { toolsNuxtAuth } from './tools/auth'
import { toolsDatabase } from './tools/database'
import { toolsUIUXDesign } from './tools/uiux-design'
import { toolsAccessibility } from './tools/accessibility'
import { toolsDesignSystem } from './tools/design-system'

export interface ModuleOptions extends ViteMcpOptions {
  /**
   * Includes the online Nuxt MCP server from https://mcp.nuxt.com/sse
   *
   * This MCP would provide information about the Nuxt ecosystem, including
   * the latest documentation, available modules, etc.
   *
   * @default true
   */
  includeNuxtDocsMcp?: boolean
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
    includeNuxtDocsMcp: true,
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
      updateConfigServerName: 'nuxt',
      ...options,
      updateConfigAdditionalServers: [
        ...options.updateConfigAdditionalServers || [],
        ...(
          options.includeNuxtDocsMcp
            ? [{
                name: 'nuxt-docs',
                url: 'https://mcp.nuxt.com/sse',
              }]
            : []),
      ],
      port: options.port || nuxt.options.devServer.port,
      async mcpServerSetup(mcp, vite) {
        await options.mcpServerSetup?.(mcp, vite)

        // Detect installed modules
        const installedModules = nuxt.options._installedModules.map(i => i.meta.name || (i as any).name).filter(Boolean)
        const modules = {
          hasNuxtUI: installedModules.includes('@nuxt/ui'),
          hasNuxtAuth: installedModules.includes('nuxt-auth-utils'),
          hasDrizzle: installedModules.some(m => m.includes('drizzle')) || 
                      Object.keys(nuxt.options.runtimeConfig.public || {}).some(k => k.includes('database')) ||
                      Object.keys(process.env).some(k => k.includes('DATABASE')),
          hasUIUXNeeds: true, // UI/UX expertise is always available for any project
        }

        const context: McpToolContext = {
          unimport: unimport.promise,
          nitro: nitro.promise,
          nuxt,
          vite,
          mcp,
          modules,
        }

        // Core prompts and tools
        promptNuxtBasic(context)
        toolsNuxtRuntime(context)
        toolsScaffold(context)

        // Extended prompts and tools
        promptNuxtUI(context)
        promptNuxtAuth(context)
        promptDatabase(context)
        promptFullstack(context)
        
        // UI/UX expert prompts (always available)
        promptDesignExpert(context)
        promptAccessibilityExpert(context)
        
        toolsNuxtUI(context)
        toolsNuxtAuth(context)
        toolsDatabase(context)
        
        // UI/UX design tools (always available)
        toolsUIUXDesign(context)
        toolsAccessibility(context)
        toolsDesignSystem(context)

        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-ignore skip type infer
        await nuxt.callHook('mcp:setup', context)
      },
    }), { client: true, server: false })
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
