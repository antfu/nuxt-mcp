import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { App as H3App } from 'h3'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import DEBUG from 'debug'
import { createApp, createError, eventHandler, getQuery, getRequestURL, readBody } from 'h3'

const debug = DEBUG('vite:mcp:server')

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

    const transport = new SSEServerTransport(new URL('../messages', getRequestURL(event)).pathname, res)
    clientTransports.set(transport.sessionId, transport)
    debug('SSE Connected %s', transport.sessionId)
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

    const body = await readBody(event)
    debug('Message from %s', clientId, body)
    await transport.handlePostMessage(event.node.req, event.node.res)
  }))

  return app
}
