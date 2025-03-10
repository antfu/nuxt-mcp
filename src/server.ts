import { createServer } from 'node:http'
import process from 'node:process'
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createApp, createError, eventHandler, toNodeListener } from 'h3'
import { z } from 'zod'

const server = new McpServer(
  {
    name: 'mcp-starter',
    version: '0.1.0',
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

process.on('SIGINT', async () => {
  await server.close()
  process.exit(0)
})

const app = createApp()

let transport: SSEServerTransport

app.use('/sse', eventHandler(async (event) => {
  const res = event.node.res
  transport = new SSEServerTransport('/messages', res)
  await server.connect(transport)
}))

app.use('/messages', eventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  await transport?.handlePostMessage(event.node.req, event.node.res)
}))

// Start the server
createServer(toNodeListener(app))
  .listen(3001, () => {
    // eslint-disable-next-line no-console
    console.log('Server running on http://localhost:3001')
  })
