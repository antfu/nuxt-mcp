import type { ViteDevServer } from 'vite'
import type { ViteMcpOptions } from './types'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { version } from '../package.json'

export function createMcpServerDefault(
  options: ViteMcpOptions,
  _vite: ViteDevServer,
): McpServer {
  const server = new McpServer(
    {
      name: 'vite',
      version,
      ...options.mcpServerInfo,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        logging: {},
      },
    },
  )

  // Add an addition tool
  server.tool(
    'add',
    'Add two numbers. You can only use this tool to add two numbers.',
    {
      a: z.number()
        .describe('The first number to add'),
      b: z.number()
        .describe('The second number to add'),
    },
    async ({ a, b }) => ({
      content: [{ type: 'text', text: String(a + b) }],
    }),
  )
  // Add a dynamic greeting resource
  server.resource(
    'greeting',
    new ResourceTemplate('greeting://{name}', { list: undefined }),
    async (uri, { name }) => ({
      contents: [{
        uri: uri.href,
        text: `Hello, ${name}!`,
      }],
    }),
  )

  return server
}
