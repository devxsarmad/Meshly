import { FilterQuery, Types } from 'mongoose';
import { ProductDocument, ProductModel } from '../models/product-model';

export interface ProductFilters { search?: string; category?: string; activeOnly?: boolean; }

export const productRepository = {
  list: async (filters: ProductFilters) => {
    const query: FilterQuery<ProductDocument> = {};
    if (filters.activeOnly) query.isActive = true;
    if (filters.category) query.category = filters.category;
    if (filters.search) query.$text = { $search: filters.search };
    return ProductModel.find(query).sort({ createdAt: -1 }).lean();
  },
  findById: (id: string) => Types.ObjectId.isValid(id) ? ProductModel.findById(id).lean() : null,
  create: (data: Partial<ProductDocument>) => ProductModel.create(data),
  update: (id: string, data: Partial<ProductDocument>) => Types.ObjectId.isValid(id) ? ProductModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean() : null,
  delete: (id: string) => Types.ObjectId.isValid(id) ? ProductModel.findByIdAndDelete(id).lean() : null,
};
