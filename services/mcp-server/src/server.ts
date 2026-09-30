import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const productServiceUrl = (process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002').replace(/\/$/, '');
const orderServiceUrl = (process.env.ORDER_SERVICE_URL ?? 'http://localhost:3004').replace(/\/$/, '');
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;

type Product = { _id: string; name: string; description: string; price: number; category: string; inventoryCount: number; imageUrl?: string; isActive: boolean };
type ApiResponse<T> = { success: boolean; message?: string; data: T };

async function productRequest<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${productServiceUrl}${path}`);
  } catch {
    throw new Error(`Product service is unavailable at ${productServiceUrl}`);
  }
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? `Product service returned HTTP ${response.status}`);
  }
  return payload.data;
}

async function orderRequest<T>(path: string, userId: string): Promise<T> {
  if (!jwtAccessSecret) throw new Error('JWT_ACCESS_SECRET is required to access order status');
  // MCP stdio calls do not carry the browser session. The explicit userId is
  // converted into a short-lived service-signed token so order-service still
  // applies its existing user-scoped authorization check.
  const accessToken = jwt.sign({ userId }, jwtAccessSecret, { expiresIn: '1m' });
  let response: Response;
  try {
    response = await fetch(`${orderServiceUrl}${path}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  } catch {
    throw new Error(`Order service is unavailable at ${orderServiceUrl}`);
  }
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? `Order service returned HTTP ${response.status}`);
  }
  return payload.data;
}

const server = new McpServer({
  name: 'meshly-mcp-server',
  version: '1.0.0',
});

server.registerTool(
  'ping',
  {
    description: 'Check that the Meshly MCP server is reachable.',
  },
  async () => ({
    content: [{ type: 'text', text: 'pong' }],
  }),
);

server.registerTool(
  'get_order_status',
  {
    description: 'Get an order status for a specific user. The explicit userId prevents access to another user\'s order.',
    inputSchema: {
      orderId: z.string().trim().min(1).describe('The order ID to inspect'),
      userId: z.string().trim().min(1).describe('The authenticated Meshly user ID who owns the order'),
    },
  },
  async ({ orderId, userId }) => {
    const order = await orderRequest<{ id: string; status: string; totalAmount: number; createdAt: string }>(`/api/orders/${encodeURIComponent(orderId)}`, userId);
    return { content: [{ type: 'text', text: JSON.stringify({ orderId: order.id, status: order.status, totalAmount: order.totalAmount, createdAt: order.createdAt }) }] };
  },
);

server.registerTool(
  'search_products',
  {
    description: 'Search the public Meshly product catalog by name, description, or category.',
    inputSchema: { query: z.string().trim().min(1).describe('Search text, for example carafe or clothing') },
  },
  async ({ query }) => {
    const data = await productRequest<{ items: Product[]; pagination: unknown }>(`/api/products?search=${encodeURIComponent(query)}&page=1&limit=20`);
    const products = data.items.map(({ _id, name, price }) => ({ id: _id, name, price }));
    return { content: [{ type: 'text', text: JSON.stringify({ query, products }) }] };
  },
);

server.registerTool(
  'get_product_details',
  {
    description: 'Get full public details for one Meshly product by product ID.',
    inputSchema: { productId: z.string().trim().min(1).describe('The product-service product ID') },
  },
  async ({ productId }) => {
    const product = await productRequest<Product>(`/api/products/${encodeURIComponent(productId)}`);
    return { content: [{ type: 'text', text: JSON.stringify(product) }] };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
