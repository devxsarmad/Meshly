'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { MeshlyLoader } from '../../../components/ui/meshly-loader';
import { getProduct, Product } from '../../../lib/api';
import { addToCart } from '../../../features/cart/api';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    if (!params.id) return;
    getProduct(params.id)
      .then(setProduct)
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading product…" /></div>;
  if (error || !product) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="text-center"><p className="text-error">{error || 'Product not found.'}</p><Link href="/catalog"><Button className="mt-5">Back to catalog</Button></Link></Card></div>;

  const available = product.inventoryCount > 0;
  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    setCartMessage('');
    try { await addToCart({ productId: product._id, name: product.name, price: product.price, quantity, imageUrl: product.imageUrl }); setCartMessage('Added to your cart.'); } catch (reason) { setCartMessage(reason instanceof Error ? reason.message : 'Unable to add this item to your cart.'); } finally { setAdding(false); }
  }
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <Link href="/catalog" className="text-small text-text-secondary hover:text-primary">← Back to catalog</Link>
    <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
      <div className="flex aspect-square items-center justify-center rounded border border-border bg-primary/5">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded object-cover" /> : <span className="font-mono text-small uppercase tracking-[0.12em] text-text-secondary">Meshly / {product.category}</span>}</div>
      <div className="pt-2"><Badge tone="accent">{product.category}</Badge><h1 className="mt-6 font-heading text-h1">{product.name}</h1><p className="mt-5 font-mono text-body text-primary">${product.price.toFixed(2)}</p><p className="mt-8 max-w-xl text-body text-text-secondary">{product.description}</p><div className="mt-8 border-y border-border py-6"><p className="text-small text-text-secondary">{available ? `${product.inventoryCount} available` : 'Currently unavailable'}</p><div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex items-center rounded border border-border"><button type="button" className="h-11 w-11 text-primary disabled:text-text-secondary" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={!available || quantity === 1} aria-label="Decrease quantity">−</button><span className="w-10 text-center font-mono text-small">{quantity}</span><button type="button" className="h-11 w-11 text-primary disabled:text-text-secondary" onClick={() => setQuantity((value) => Math.min(product.inventoryCount, value + 1))} disabled={!available || quantity >= product.inventoryCount} aria-label="Increase quantity">+</button></div><Button disabled={!available || adding} onClick={() => void handleAddToCart()}>{adding ? 'Adding…' : available ? 'Add to cart' : 'Sold out'}</Button></div>{cartMessage && <p className={`mt-4 text-small ${cartMessage === 'Added to your cart.' ? 'text-success' : 'text-error'}`} role="status">{cartMessage}{cartMessage === 'Added to your cart.' && <Link href="/cart" className="ml-2 underline underline-offset-4">View cart</Link>}</p>}</div><p className="mt-6 text-small text-text-secondary">Secure checkout and delivery details will be available in the next shopping-flow chunk.</p></div>
    </div>
  </div>;
}
