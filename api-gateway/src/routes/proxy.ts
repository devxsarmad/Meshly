import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env';

export const proxyRouter = Router();
const proxyOptions = { changeOrigin: true };
proxyRouter.use('/auth', createProxyMiddleware({ ...proxyOptions, target: env.authServiceUrl, pathRewrite: { '^/': '/api/auth/' } }));
proxyRouter.use('/products', createProxyMiddleware({ ...proxyOptions, target: env.productServiceUrl, pathRewrite: { '^/': '/api/products/' } }));
proxyRouter.use('/cart', createProxyMiddleware({ ...proxyOptions, target: env.cartServiceUrl, pathRewrite: { '^/': '/api/cart/' } }));
proxyRouter.use('/orders', createProxyMiddleware({ ...proxyOptions, target: env.orderServiceUrl, pathRewrite: { '^/': '/api/orders/' } }));
