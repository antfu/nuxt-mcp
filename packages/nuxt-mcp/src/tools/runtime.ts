import type { Component, NuxtPage } from '@nuxt/schema'
import type { McpToolContext } from '../types'

export function toolsNuxtRuntime({ mcp, nuxt, unimport }: McpToolContext): void {
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
    'list-nuxt-auto-imports-items',
    'List auto-imports items, when importing new functions to the code, check available items from this tool.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            items: await (await unimport).getImports(),
          }, null, 2),
        }],
      }
    },
  )

  let components: Component[] = []
  nuxt.hook('components:extend', (_components) => {
    components = _components
  })

  mcp.tool(
    'list-nuxt-components',
    'List registered components in the Nuxt app. When adding importing new components, check available components from this tool.',
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

  let pages: NuxtPage[] = []
  nuxt.hook('pages:extend', (_pages) => {
    pages = _pages
  })

  mcp.tool(
    'list-nuxt-pages',
    'List registered pages and their metadata in the Nuxt app.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(pages, null, 2),
        }],
      }
    },
  )

  mcp.tool(
    'list-nuxt-hooks',
    'List registered hooks in the Nuxt app.',
    {},
    async () => {
      return {
        content: [{
          type: 'text',
          // @ts-expect-error - private _hooks property
          text: JSON.stringify(Object.keys(nuxt.hooks._hooks), null, 2),
        }],
      }
    },
  )
}
