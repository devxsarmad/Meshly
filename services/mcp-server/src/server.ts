import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createToolHandlers, inputSchemas, requiredConfig } from './tools.js';

const config = requiredConfig(process.env);
const handlers = createToolHandlers(config);
const server = new McpServer({ name: 'meshly-mcp-server', version: '1.0.0' });

server.registerTool('ping', { description: 'Check that the Meshly MCP server is reachable.' }, handlers.ping);
server.registerTool('search_products', { description: 'Search the public Meshly product catalog by name, description, or category.', inputSchema: inputSchemas.searchProducts.shape }, handlers.searchProducts);
server.registerTool('get_product_details', { description: 'Get full public details for one Meshly product by product ID.', inputSchema: inputSchemas.getProductDetails.shape }, handlers.getProductDetails);
server.registerTool('list_categories', { description: 'List categories with active Meshly products.', inputSchema: {} }, handlers.listCategories);
server.registerTool('get_order_status', { description: 'Get an order status for a specific user; userId is explicit because MCP stdio does not carry Meshly login identity.', inputSchema: inputSchemas.getOrderStatus.shape }, handlers.getOrderStatus);
server.registerTool('get_order_history', { description: 'List recent orders for a Meshly user. Supply the explicit userId because MCP stdio does not carry Meshly login identity.', inputSchema: inputSchemas.getOrderHistory.shape }, handlers.getOrderHistory);
server.registerTool('check_club_membership', { description: 'Check Meshly Club membership status and renewal date for a user.', inputSchema: inputSchemas.checkClubMembership.shape }, handlers.checkClubMembership);

await server.connect(new StdioServerTransport());
