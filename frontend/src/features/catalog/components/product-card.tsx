'use client';

import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { ProductImage } from '../../../components/ui/product-image';
import { WishlistButton } from '../../wishlist/components/wishlist-button';

export type ProductCardData = {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  inventoryCount?: number;
};

type ProductCardProps = {
  product: ProductCardData;
  saved?: boolean;
  onWishlistChange?: (saved: boolean) => void;
  showCategory?: boolean;
  showDescription?: boolean;
  showStock?: boolean;
  showAddToCart?: boolean;
  addToCartLabel?: string;
  onAddToCart?: () => void;
  addToCartBusy?: boolean;
};

export function ProductCard({ product, saved = false, onWishlistChange, showCategory = true, showDescription = true, showStock = true, showAddToCart = false, addToCartLabel = 'Add to cart', onAddToCart, addToCartBusy = false }: ProductCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="relative">
        <Link href={`/catalog/${product.id}`} className="block">
          <div className="flex aspect-[4/3] items-center justify-center bg-primary/5">
            <ProductImage src={product.imageUrl} alt={product.name} />
          </div>
        </Link>
        <WishlistButton
          item={{ productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl }}
          saved={saved}
          onChange={onWishlistChange}
          className="absolute right-3 top-3 z-10 bg-surface/95"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div>
          {showCategory && product.category && <p className="font-mono text-small uppercase tracking-[0.1em] text-accent">{product.category}</p>}
          <Link href={`/catalog/${product.id}`}>
            <h2 className={`${showCategory ? 'mt-3' : ''} font-heading text-h4 text-text-primary`}>{product.name}</h2>
          </Link>
        </div>
        {showDescription && product.description && <p className="mt-3 line-clamp-2 text-small text-text-secondary">{product.description}</p>}
        {showStock && <div className="mt-5 flex items-center justify-between"><span className="font-mono text-small text-primary">${product.price.toFixed(2)}</span><span className="text-small text-text-secondary">{(product.inventoryCount || 0) > 0 ? 'In stock' : 'Sold out'}</span></div>}
        {!showStock && <p className="mt-2 font-mono text-small text-primary">${product.price.toFixed(2)}</p>}
        {showAddToCart && <Button className="mt-6 w-full" disabled={addToCartBusy} onClick={onAddToCart}>{addToCartBusy ? 'Adding…' : addToCartLabel}</Button>}
      </div>
    </Card>
  );
}
