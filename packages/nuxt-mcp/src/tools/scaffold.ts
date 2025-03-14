import type { CommandDef } from 'citty'
import type { McpToolContext } from '../types'
import process from 'node:process'
import c from 'ansis'
import { z } from 'zod'

interface AddArgs {
  cwd?: string
  force?: boolean
  template: string
  name: string
}

export function toolsScaffold({ mcp, nuxt }: McpToolContext): void {
  const setup = async (): Promise<{ add: CommandDef, run: typeof import('citty')['runCommand'] }> => {
    const { main } = await import('nuxi')
    const add = await (await main.subCommands! as any).add() as CommandDef
    const { runCommand: run } = await import('citty')
    return {
      add,
      run,
    }
  }

  const promise = setup()

  async function add(args: string[], options?: AddArgs): Promise<any> {
    const { add, run } = await promise
    return await run(add, {
      rawArgs: [
        '--cwd',
        nuxt.options.rootDir,
        ...args,
      ],
      data: {
        cwd: nuxt.options.rootDir,
        ...options,
      },
    }).then(r => r.result)
  }

  mcp.tool(
    'nuxt-scaffold',
    'Scaffold a new component/page/layout/middleware etc. in the current Nuxt project.',
    {
      // api, app, app-config, component, composable, error, layer, layout, middleware, module, page, plugin, server-middleware, server-plugin, server-route, server-util
      template: z.enum(['api', 'app', 'app-config', 'component', 'composable', 'error', 'layer', 'layout', 'middleware', 'module', 'page', 'plugin', 'server-middleware', 'server-plugin', 'server-route', 'server-util'])
        .describe('Type of the file to scaffold'),
      name: z.string()
        .describe('Name of the component to add'),
    },
    async ({ template, name }) => {
      const { stdout, stderr, result } = await interceptStdout(async () => {
        return await add([
          template,
          name,
        ])
      })
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            nuxtRoot: nuxt.options.rootDir,
            nuxtSrcDir: nuxt.options.srcDir,
            cliResult: {
              stdout,
              stderr,
              result: String(result) || 'OK',
            },
          }, null, 2),
        }],
      }
    },
  )
}

async function interceptStdout<T = any>(fn: () => Promise<T> | T): Promise<{
  stdout: string
  stderr: string
  result: T
}> {
  const stdout: string[] = []
  const stderr: string[] = []

  const oldStdout = process.stdout.write
  const oldStderr = process.stderr.write
  process.stdout.write = (chunk) => {
    stdout.push(chunk.toString())
    return oldStdout.call(process.stdout, chunk)
  }
  process.stderr.write = (chunk) => {
    stderr.push(chunk.toString())
    return oldStderr.call(process.stderr, chunk)
  }
  try {
    const result = await fn()
    return {
      stdout: c.strip(stdout.join('\n')),
      stderr: c.strip(stderr.join('\n')),
      result,
    }
  }
  finally {
    process.stdout.write = oldStdout
    process.stderr.write = oldStderr
  }
}
