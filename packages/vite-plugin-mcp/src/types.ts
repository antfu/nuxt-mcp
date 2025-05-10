import type { Awaitable } from '@antfu/utils'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { Implementation as McpServerInfo } from '@modelcontextprotocol/sdk/types.js'
import type { ViteDevServer } from 'vite'

export type SupportedUpdateConfigType = 'cursor' | 'vscode' | 'windsurf'

export type MaybeArray<T> = T | T[]

export type { McpServer }

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
   * Print the MCP server URL in the console
   *
   * @default true
   */
  printUrl?: boolean

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
   * The root route to the MCP server, default is `/__mcp`
   */
  mcpRouteRoot?: string

  /**
   * The config types to update
   *
   * - `auto` - Automatically update the config files if they exists
   * - `cursor` - Update the cursor config file `.cursor/mcp.json`
   * - `vscode` - Update the VSCode config file `.vscode/settings.json`
   * - `windsurf` - Update the Windsurf config file `~/.codeium/windsurf/mcp_config.json`
   *
   * @default 'auto'
   */
  updateConfig?: 'auto' | false | MaybeArray<SupportedUpdateConfigType>

  /**
   * The name of the MCP server when updating the config files
   *
   * @default 'vite'
   */
  updateConfigServerName?: string

  // --------- DEPRECATED ---------

  /**
   * @deprecated Use `mcpRouteRoot` instead
   */
  mcpPath?: string
}
