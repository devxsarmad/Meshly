import jwt from "jsonwebtoken";
import { z } from "zod";

const entityId = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Use only letters, numbers, hyphens, or underscores",
  );
export const inputSchemas = {
  getOrderStatus: z.object({ orderId: entityId, userId: entityId }),
  getOrderHistory: z.object({ userId: entityId }),
  checkClubMembership: z.object({ userId: entityId }),
  searchProducts: z.object({ query: z.string().trim().min(1).max(200) }),
  getProductDetails: z.object({
    productId: z
      .string()
      .trim()
      .regex(/^[a-f\d]{24}$/i, "Expected a 24 character product ID"),
  }),
};

export interface ToolConfig {
  productServiceUrl: string;
  orderServiceUrl: string;
  paymentServiceUrl: string;
  jwtAccessSecret: string;
  internalServiceKey: string;
}

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inventoryCount: number;
  imageUrl?: string;
  isActive: boolean;
};
type ApiResponse<T> = { success: boolean; message?: string; data: T };
type Fetcher = typeof fetch;

export function requiredConfig(env: NodeJS.ProcessEnv): ToolConfig {
  const required = (key: string, url = false): string => {
    const value = env[key]?.trim();
    if (!value)
      throw new Error(
        `[mcp-server] Missing required environment variable ${key}`,
      );
    return url ? value.replace(/\/$/, "") : value;
  };
  return {
    productServiceUrl: required("PRODUCT_SERVICE_URL", true),
    orderServiceUrl: required("ORDER_SERVICE_URL", true),
    paymentServiceUrl: required("PAYMENT_SERVICE_URL", true),
    jwtAccessSecret: required("JWT_ACCESS_SECRET"),
    internalServiceKey: required("INTERNAL_SERVICE_KEY"),
  };
}

function toolError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Unexpected downstream service error";
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: { code: "MESHLY_TOOL_ERROR", message } }),
      },
    ],
  };
}

export function createToolHandlers(
  config: ToolConfig,
  fetcher: Fetcher = fetch,
) {
  async function request<T>(
    service: "product" | "order" | "payment",
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const base =
      service === "product"
        ? config.productServiceUrl
        : service === "order"
          ? config.orderServiceUrl
          : config.paymentServiceUrl;
    let response: Response;
    try {
      response = await fetcher(`${base}${path}`, {
        ...options,
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      const reason =
        error instanceof Error && error.name === "TimeoutError"
          ? "timed out"
          : "is unavailable";
      throw new Error(
        `${service[0].toUpperCase()}${service.slice(1)} service ${reason} at ${base}`,
      );
    }
    const payload = (await response
      .json()
      .catch(() => null)) as ApiResponse<T> | null;
    if (!response.ok || !payload?.success) {
      throw new Error(
        payload?.message ??
          `${service[0].toUpperCase()}${service.slice(1)} service returned HTTP ${response.status}`,
      );
    }
    return payload.data;
  }

  function orderHeaders(userId: string): HeadersInit {
    // MCP stdio has no browser identity; until real auth is wired, callers supply userId explicitly.
    const accessToken = jwt.sign({ userId }, config.jwtAccessSecret, {
      expiresIn: "1m",
    });
    return { Authorization: `Bearer ${accessToken}` };
  }

  async function safe<T>(fn: () => Promise<T>) {
    try {
      return {
        content: [{ type: "text" as const, text: JSON.stringify(await fn()) }],
      };
    } catch (error) {
      return toolError(error);
    }
  }

  return {
    ping: async () => ({ content: [{ type: "text" as const, text: "pong" }] }),
    searchProducts: ({ query }: z.infer<typeof inputSchemas.searchProducts>) =>
      safe(async () => {
        const data = await request<{ items: Product[] }>(
          "product",
          `/api/products?search=${encodeURIComponent(query)}&page=1&limit=20`,
        );
        return {
          query,
          products: data.items.map(({ _id, name, price }) => ({
            id: _id,
            name,
            price,
          })),
        };
      }),
    getProductDetails: ({
      productId,
    }: z.infer<typeof inputSchemas.getProductDetails>) =>
      safe(() =>
        request<Product>(
          "product",
          `/api/products/${encodeURIComponent(productId)}`,
        ),
      ),
    listCategories: () =>
      safe(() => request<string[]>("product", "/api/products/categories")),
    getOrderStatus: ({
      orderId,
      userId,
    }: z.infer<typeof inputSchemas.getOrderStatus>) =>
      safe(async () => {
        const order = await request<{
          id: string;
          status: string;
          totalAmount: number;
          createdAt: string;
        }>("order", `/api/orders/${encodeURIComponent(orderId)}`, {
          headers: orderHeaders(userId),
        });
        return {
          orderId: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        };
      }),
    getOrderHistory: ({
      userId,
    }: z.infer<
    typeof inputSchemas.getOrderHistory>) =>
      safe(async () => {
        const result = await request<{
          items: Array<{
            id: string;
            status: string;
            totalAmount: number;
            createdAt: string;
          }>;
          pagination: unknown;
        }>("order", "/api/orders?page=1&limit=50", {
          headers: orderHeaders(userId),
        });
        return result.items.map(({ id, status, totalAmount, createdAt }) => ({
          orderId: id,
          status,
          totalAmount,
          createdAt,
        }));
      }),
    checkClubMembership: ({
      userId,
    }: z.infer<typeof inputSchemas.checkClubMembership>) =>
      safe(async () => {
        const membership = await request<{
          status: string;
          currentPeriodEnd?: string | Date | null;
        } | null>(
          "payment",
          `/internal/subscriptions/${encodeURIComponent(userId)}`,
          { headers: { "x-internal-service-key": config.internalServiceKey } },
        );
        return membership
          ? {
              status:
                membership.status === "ACTIVE"
                  ? "active"
                  : membership.status.toLowerCase(),
              renewalDate: membership.currentPeriodEnd ?? null,
            }
          : { status: "none", renewalDate: null };
      }),
  };
}
