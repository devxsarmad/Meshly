# Meshly MCP Server

Meshly's MCP server lets an MCP-compatible AI client, such as Claude Desktop, call selected Meshly capabilities as tools. It currently uses the stdio transport, so Claude launches this server locally as a subprocess instead of calling an HTTP endpoint.

## Available tools

- `ping` — confirms that the MCP server is connected.
- `search_products` — searches the public product catalog by query.
- `get_product_details` — returns public details for a product ID.
- `get_order_status` — returns an order's status, total, and creation date for its owner.

## Run locally

Install dependencies and build the server:

```bash
npm install
npm run build
```

For development, run:

```bash
npm run dev
```

The server is normally launched by the MCP client. For Claude Desktop, add this entry to `~/Library/Application Support/Claude/claude_desktop_config.json` and replace the secret with the value used by order-service:

```json
{
  "mcpServers": {
    "meshly": {
      "command": "/Users/macbook/DevProjects/personal/meshly/services/mcp-server/node_modules/.bin/tsx",
      "args": [
        "/Users/macbook/DevProjects/personal/meshly/services/mcp-server/src/server.ts"
      ],
      "env": {
        "PRODUCT_SERVICE_URL": "http://localhost:3002",
        "ORDER_SERVICE_URL": "http://localhost:3004",
        "JWT_ACCESS_SECRET": "replace-with-order-service-secret"
      }
    }
  }
}
```

Restart Claude Desktop after changing this file. Product-service and order-service must be running locally.

## Authentication limitation

MCP stdio tool calls do not carry Meshly's browser cookies or a real user session. Therefore, `get_order_status` requires an explicit `userId` and the server creates a short-lived JWT signed with `JWT_ACCESS_SECRET`. Order-service still performs the normal user-scoped authorization check, so a user ID cannot access another user's order. A production MCP integration should replace this development approach with MCP/OAuth-based identity and authorization rather than trusting a caller-provided user ID.

This server is read-only for now. It does not create orders, change products, or perform other write operations.
