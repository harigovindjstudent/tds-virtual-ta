/**
 * MCP server configuration types for Anthropic provider
 */
export interface MCPServerConfig {
    path?: string;
    command?: string;
    args?: string[];
    name?: string;
    url?: string;
    auth?: MCPServerAuth;
    headers?: Record<string, string>;
}
export interface MCPServerAuth {
    type: 'bearer' | 'api_key';
    token?: string;
    api_key?: string;
}
export interface MCPConfig {
    enabled: boolean;
    server?: MCPServerConfig;
    servers?: MCPServerConfig[];
    timeout?: number;
    tools?: string[];
    exclude_tools?: string[];
    debug?: boolean;
    verbose?: boolean;
}
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}
export interface MCPToolResult {
    content: string;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map