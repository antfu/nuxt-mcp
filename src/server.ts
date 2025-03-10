import type { App as H3App } from 'h3'
import { createServer } from 'node:http'
import process from 'node:process'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createApp, createError, eventHandler, getQuery, toNodeListener } from 'h3'
import { z } from 'zod'
import { version } from '../package.json'

const server = new McpServer(
  {
    name: 'nuxt-mcp',
    version,
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

export function createMcpH3App(server: McpServer): H3App {
  const app = createApp({
    onError(error, event) {
      console.error('Failed to handle event', event)
      console.error(error)
    },
  })

  // Map to store client-specific transports
  const clientTransports = new Map<string, SSEServerTransport>()

  app.use('/sse', eventHandler(async (event) => {
    const res = event.node.res

    const transport = new SSEServerTransport('../messages', res)
    clientTransports.set(transport.sessionId, transport)
    res.on('close', () => {
      clientTransports.delete(transport.sessionId)
    })
    await server.connect(transport)
  }))

  app.use('/messages', eventHandler(async (event) => {
    if (event.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
    }

    const clientId = event.node.req.headers['x-session-id']
      || getQuery(event).sessionId

    if (!clientId || typeof clientId !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client ID not provided',
      })
    }

    const transport = clientTransports.get(clientId)
    if (!transport) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transport not found',
      })
    }

    await transport.handlePostMessage(event.node.req, event.node.res)
  }))

  return app
}

const app = createMcpH3App(server)

// Start the server
createServer(toNodeListener(app))
  .listen(3001, () => {
    // eslint-disable-next-line no-console
    console.log('Server running on http://localhost:3001')
  })

process.on('SIGINT', async () => {
  await server.close()
  process.exit(0)
})
