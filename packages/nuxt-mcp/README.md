# nuxt-mcp

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

MCP server helping models to understand your Nuxt app better.

> [!IMPORTANT]
> Experimental. Use with caution.

```ts
// nuxt.config.ts

export default defineNuxtConfig({
  modules: ['nuxt-mcp'],
})
```

Then the MCP server will be available at `http://localhost:3000/__mcp/sse`.

> 💡 When using VSCode, Cursor, Windsurf, Claude Code, the module will automatically update the config files for you.

## Module Hooks

For other modules to provide additional information to MCP, you can use the `mcp:setup` hook.

```ts
// src/module.ts

export default defineNuxtModule({
  meta: {
    name: 'my-module',
  },
  async setup(options, nuxt) {
    nuxt.hook('mcp:setup', ({ mcp }) => {
      // Setup your MCP tools here
      // For example
      mcp.tool('get-nuxt-root', 'Get the Nuxt root path', {}, async () => {
        return {
          content: [{
            type: 'text',
            text: nuxt.options.rootDir,
          }],
        }
      })
    })
  },
})
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © [Anthony Fu](https://github.com/antfu)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-mcp?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/nuxt-mcp
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-mcp?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/nuxt-mcp
[bundle-src]: https://img.shields.io/bundlephobia/minzip/nuxt-mcp?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=nuxt-mcp
[license-src]: https://img.shields.io/github/license/antfu/nuxt-mcp.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/antfu/nuxt-mcp/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/nuxt-mcp
