# Meshly MCP Server

The Model Context Protocol (MCP) is a standard way for AI applications to call tools exposed by another program. Meshly's MCP server gives Claude Desktop read-only access to selected catalog, order, and Meshly Club information through a local stdio connection.

## Available tools

| Tool | What it returns | Example question for Claude Desktop |
| --- | --- | --- |
| `ping` | Confirms that the server is reachable. | “Is Meshly connected?” |
| `search_products` | Up to 20 catalog matches by name, description, or category. | “Find me a ceramic cup.” |
| `get_product_details` | Public details for a product ID (24 character MongoDB ID). | “Show details for product `0123456789abcdef01234567`.” |
| `list_categories` | Categories that have active products. | “What product categories are available?” |
| `get_order_status` | Status, total, and date for one order. | “Check order `ord_123` for user `user_123`.” |
| `get_order_history` | Up to 50 recent orders with status, total, and date. | “Show recent orders for user `user_123`.” |
| `check_club_membership` | Membership status and renewal date, or `none`. | “Is user `user_123` a Meshly Club member?” |

Order and membership questions need the user's explicit Meshly ID. Keep these questions private: the ID does not prove that the caller owns the account.

## Configure Claude Desktop

From `services/mcp-server`, install dependencies and compile:

```bash
npm install
npm run build
```

Add this server entry to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`). Replace the project path if needed and use the same secrets configured for the local services:

```json
{
  "mcpServers": {
    "meshly": {
      "command": "node",
      "args": ["/Users/macbook/DevProjects/personal/meshly/services/mcp-server/dist/server.js"],
      "env": {
        "PRODUCT_SERVICE_URL": "http://localhost:3002",
        "ORDER_SERVICE_URL": "http://localhost:3004",
        "PAYMENT_SERVICE_URL": "http://localhost:3005",
        "JWT_ACCESS_SECRET": "change-me-access-secret",
        "INTERNAL_SERVICE_KEY": "meshly-internal-dev-key"
      }
    }
  }
}
```

Start the product, order, and payment services, then restart Claude Desktop. The server requires all five environment variables at startup and reports a clear missing-variable message if one is absent. Tool-level service errors are returned as structured MCP errors.

## Known Limitations

- Order and membership tools take an explicit `userId`; MCP stdio does not yet use Meshly's real signed-in identity. Order calls create a short-lived service-signed token, while membership lookup uses the internal service key.
- Transport is stdio-only; there is no remote or HTTP transport.
- The tools are read-only. Write tools are future work and need idempotency protections and clear user confirmation flows before they are added.

## Tests

Run unit tests and the TypeScript build from this directory:

```bash
npm test
npm run build
```
