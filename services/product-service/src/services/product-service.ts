import { productRepository, ProductFilters } from '../repositories/product-repository';
import { AppError } from '../utils/errors';

export interface ProductInput { name: string; description: string; price: number; sku: string; category: string; inventoryCount: number; imageUrl?: string; isActive?: boolean; }

export const productService = {
  list: (filters: ProductFilters) => productRepository.list(filters),
  async getById(id: string) { const product = await productRepository.findById(id); if (!product) throw new AppError(404, 'Product not found'); return product; },
  async create(input: ProductInput) { return productRepository.create({ ...input, sku: input.sku.toUpperCase() }); },
  async update(id: string, input: Partial<ProductInput>) { const product = await productRepository.update(id, { ...input, ...(input.sku ? { sku: input.sku.toUpperCase() } : {}) }); if (!product) throw new AppError(404, 'Product not found'); return product; },
  async remove(id: string) { const product = await productRepository.delete(id); if (!product) throw new AppError(404, 'Product not found'); },
};
