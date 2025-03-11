import type { Awaitable } from '@antfu/utils'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Implementation as McpServerInfo } from '@modelcontextprotocol/sdk/types.js'
import type { ViteDevServer } from 'vite'

export interface ViteMcpOptions {
  /**
   * The host to listen on, default is `localhost`
   */
  host?: string

  /**
   * The port to listen on, default is the port of the Vite dev server
   */
  port?: number

  /**
   * The MCP server info. Ingored when `mcpServer` is provided
   */
  mcpServerInfo?: McpServerInfo

  /**
   * Custom MCP server, when this is provided, the built-in MCP tools will be ignored
   */
  mcpServer?: (viteServer: ViteDevServer) => Awaitable<McpServer>

  /**
   * Setup the MCP server, this is called when the MCP server is created
   * You may also return a new MCP server to replace the default one
   */
  mcpServerSetup?: (server: McpServer, viteServer: ViteDevServer) => Awaitable<void | McpServer>

  /**
   * The path to the MCP server, default is `/__mcp`
   */
  mcpPath?: string

  /**
   * Update the address of the MCP server in the cursor config file `.cursor/mcp.json`,
   * if `.cursor` folder exists.
   *
   * @default true
   */
  updateCursorMcpJson?: boolean | {
    enabled: boolean
    /**
     * The name of the MCP server, default is `vite`
     */
    serverName?: string
  }
}
