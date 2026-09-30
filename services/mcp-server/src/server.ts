import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const productServiceUrl = (process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:3002').replace(/\/$/, '');

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
