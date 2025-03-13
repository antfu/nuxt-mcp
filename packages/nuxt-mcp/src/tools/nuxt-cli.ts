import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'

const execAsync = promisify(exec)

export interface CommandResult {
  stdout: string
  stderr: string
  success: boolean
}

/**
 * Execute a Nuxt CLI command
 */
export async function executeNuxtCommand(command: string, args: string[] = []): Promise<CommandResult> {
  const fullCommand = `npx nuxi ${command} ${args.join(' ')}`

  try {
    const { stdout, stderr } = await execAsync(fullCommand)
    return { stdout, stderr, success: true }
  }
  catch (error: any) {
    // If the command fails, we still want to return the stdout and stderr
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || 'Unknown error occurred',
      success: false,
    }
  }
}

/**
 * Format the output of a command result
 * @param result The command execution result
 * @returns Formatted output string
 */
export function formatCommandResult(result: CommandResult): string {
  let output = ''

  if (result.stdout) {
    output += result.stdout
  }

  if (result.stderr) {
    output += `Error: ${result.stderr}`
  }

  return output || (result.success ? 'Command executed successfully with no output' : 'Command failed with no error message')
}

/**
 * Register Nuxt CLI tools
 */
export function registerNuxtCliTools(server: McpServer, basePath: string): void {
  // Add component command
  server.tool(
    'add-nuxt-component',
    'Add a new component to your Nuxt project.\n\nExample: \'TheHeader\' will create components/TheHeader.vue',
    {
      name: z.string().describe('Name of the component to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
      mode: z.enum(['client', 'server']).optional().describe('Optional mode: client or server component'),
    },
    async ({ name, mode }) => {
      const args = ['component', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      if (mode) {
        args.push(`--${mode}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // === Page Commands ===

  // Add page command
  server.tool(
    'add-nuxt-page',
    'Add a new page to your Nuxt project.\n\nExamples:\n- \'about\' will create pages/about.vue\n- \'category/[id]\' will create pages/category/[id].vue',
    {
      name: z.string().describe('Name of the page to add (can include path and dynamic parameters)'),
    },
    async ({ name }) => {
      const args = ['page', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Add layout command
  server.tool(
    'add-nuxt-layout',
    'Add a new layout to your Nuxt project.\n\nExample: \'custom\' will create layouts/custom.vue',
    {
      name: z.string().describe('Name of the layout to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
    },
    async ({ name }) => {
      const args = ['layout', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // === Server Commands ===

  // Add API endpoint command
  server.tool(
    'add-nuxt-api',
    'Add a new API endpoint to your Nuxt project.\n\nExample: \'hello\' will create server/api/hello.ts',
    {
      name: z.string().describe('Name of the API endpoint to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
      method: z.enum(['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'connect', 'trace']).optional().describe('HTTP method for the API endpoint'),
    },
    async ({ name, path, method }) => {
      const args = ['api', name]
      if (path) {
        args.push(`--cwd=${path}`)
      }
      if (method) {
        args.push(`--${method}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Add middleware command
  server.tool(
    'add-nuxt-middleware',
    'Add a new middleware to your Nuxt project.\n\nExample: \'auth\' will create middleware/auth.ts',
    {
      name: z.string().describe('Name of the middleware to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
      global: z.boolean().optional().describe('Whether the middleware should be global'),
    },
    async ({ name, global }) => {
      const args = ['middleware', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      if (global) {
        args.push('--global')
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // === Code Organization Commands ===

  // Add composable command
  server.tool(
    'add-nuxt-composable',
    'Add a new composable to your Nuxt project.\n\nExample: \'useFoo\' will create composables/useFoo.ts',
    {
      name: z.string().describe('Name of the composable to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
    },
    async ({ name }) => {
      const args = ['composable', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Add plugin command
  server.tool(
    'add-nuxt-plugin',
    'Add a new plugin to your Nuxt project.\n\nExample: \'analytics\' will create plugins/analytics.ts',
    {
      name: z.string().describe('Name of the plugin to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
      mode: z.enum(['client', 'server']).optional().describe('Optional mode: client or server plugin'),
    },
    async ({ name, mode }) => {
      const args = ['plugin', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }
      if (mode) {
        args.push(`--${mode}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Add layer command
  server.tool(
    'add-nuxt-layer',
    'Add a new layer to your Nuxt project.\n\nExample: \'subscribe\' will create layers/subscribe/nuxt.config.ts',
    {
      name: z.string().describe('Name of the layer to add'),
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
    },
    async ({ name }) => {
      const args = ['layer', name]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('add', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // === Project Management Commands ===

  // Dev command - starts the development server
  server.tool(
    'run-nuxt-dev',
    'Start the Nuxt development server. This will launch a local development server with hot-reloading enabled.\n\nExample: To start the server on port 4000: Use port parameter with value 4000',
    {
      port: z.number().optional().describe('Port to run the dev server on (defaults to 3000)'),
      host: z.string().optional().describe('Host to run the dev server on (defaults to localhost)'),
    },
    async ({ port, host }) => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }
      if (port) {
        args.push(`--port=${port}`)
      }
      if (host) {
        args.push(`--host=${host}`)
      }

      const result = await executeNuxtCommand('dev', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Build command - builds the Nuxt application for production
  server.tool(
    'run-nuxt-build',
    'Build the Nuxt application for production',
    {
      path: z.string().optional().describe('Path to the Nuxt project (defaults to current directory)'),
    },
    async () => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('build', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Generate command - generates a static site
  server.tool(
    'run-nuxt-generate',
    'Generate a static site with Nuxt',
    async () => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('generate', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Preview command - previews the built application
  server.tool(
    'run-nuxt-preview',
    'Preview the built Nuxt application',
    async () => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('preview', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Init command - initializes a new Nuxt project
  server.tool(
    'run-nuxt-init',
    'Initialize a new Nuxt project. This creates a new directory with a fresh Nuxt.js installation and project structure.\n\nExample: To create a new project called \'my-app\': Use name parameter with value \'my-app\'',
    {
      name: z.string().describe('Name of the new Nuxt project. This will create a directory with this name.'),
      template: z.string().optional().describe('Template to use for the new project (defaults to the standard Nuxt template)'),
    },
    async ({ name, template }) => {
      const args = [name]
      if (template) {
        args.push(`--template=${template}`)
      }

      const result = await executeNuxtCommand('init', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Info command - displays information about the Nuxt project
  server.tool(
    'get-nuxt-info',
    'Display information about the Nuxt project',
    async () => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('info', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Upgrade command - upgrades Nuxt dependencies
  server.tool(
    'run-nuxt-upgrade',
    'Upgrade Nuxt dependencies',
    async () => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('upgrade', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Cleanup command - removes generated Nuxt files and caches
  server.tool(
    'run-nuxt-cleanup',
    'Remove common generated Nuxt files and caches, including .nuxt, .output, node_modules/.vite, and node_modules/.cache directories.',
    async () => {
      const args = []

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('cleanup', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )

  // Module install command - installs a Nuxt module
  server.tool(
    'install-nuxt-module',
    'Install or add a Nuxt module into your project',
    {
      moduleName: z.string().describe('Name of the module to install'),
    },
    async ({ moduleName }) => {
      const args = ['module', 'add', moduleName]

      if (basePath) {
        args.push(`--cwd=${basePath}`)
      }

      const result = await executeNuxtCommand('', args)
      const formattedResult = formatCommandResult(result)

      return {
        content: [
          {
            type: 'text',
            text: formattedResult,
          },
        ],
      }
    },
  )
}
