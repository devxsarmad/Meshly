import { Schema, model } from 'mongoose';

export interface ProductDocument {
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  inventoryCount: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  inventoryCount: { type: Number, required: true, min: 0, default: 0 },
  imageUrl: { type: String, trim: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text' });
export const ProductModel = model<ProductDocument>('Product', productSchema);
