import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../config/env';

export const proxyRouter = Router();
proxyRouter.use('/auth', createProxyMiddleware({ target: env.authServiceUrl, changeOrigin: true, pathRewrite: { '^/auth': '/api/auth' } }));
proxyRouter.use('/products', createProxyMiddleware({ target: env.productServiceUrl, changeOrigin: true, pathRewrite: { '^/products': '/api/products' } }));
