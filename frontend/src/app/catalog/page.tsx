'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { MeshlyLoader } from '../../components/ui/meshly-loader';
import { Input } from '../../components/ui/input';
import { getProducts, Product } from '../../lib/api';
import { notify } from '../../lib/toast';
import { useAuth } from '../../features/auth/auth-context';
import { getWishlist } from '../../features/wishlist/api';
import { WishlistButton } from '../../features/wishlist/components/wishlist-button';
import { ProductImage } from '../../components/ui/product-image';

const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Kitchen', 'Travel'];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => { if (!user) { setSavedIds([]); return; } getWishlist().then((items) => setSavedIds(items.map((item) => item.productId))).catch(() => undefined); }, [user]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProducts({ search: debouncedSearch, category, page, limit: 6 })
      .then((result) => { if (active) { setProducts(result.items); setTotalPages(result.pagination.totalPages); } })
      .catch((reason: Error) => { if (active) { setError(reason.message); notify('error', reason.message); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedSearch, category, page, retryKey]);

  useEffect(() => { const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [search]);

  return <div id="catalog" className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <div className="max-w-2xl"><Badge tone="accent">The collection</Badge><h1 className="mt-6 font-heading text-h1">Objects worth keeping.</h1><p className="mt-5 text-body text-text-secondary">Browse a considered collection of useful things, selected for everyday living.</p></div>
    <div className="mt-10 flex flex-col gap-4 border-y border-border py-5 md:flex-row md:items-center md:justify-between">
      <div className="w-full max-w-md"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" /></div>
      <div className="flex flex-wrap gap-2" aria-label="Product categories">{categories.map((item) => <button type="button" key={item} onClick={() => { setCategory(item); setPage(1); }} className={`rounded px-3 py-2 text-small ${category === item ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary/10 hover:text-primary'}`}>{item}</button>)}</div>
    </div>
    {loading && <MeshlyLoader label="Loading the collection…" />}
    {!loading && error && <Card className="mt-10 border-error/30 bg-error/5 text-center"><p className="text-error">{error}</p><Button className="mt-5" onClick={() => setRetryKey((value) => value + 1)}>Try again</Button></Card>}
    {!loading && !error && products.length === 0 && <p className="py-16 text-center text-text-secondary">No products match this collection yet.</p>}
    {!loading && !error && products.length > 0 && <><div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <Card key={product._id} className="h-full overflow-hidden p-0 transition-shadow hover:shadow-md"><Link href={`/catalog/${product._id}`}><div className="flex aspect-[4/3] items-center justify-center bg-primary/5"><ProductImage src={product.imageUrl} alt={product.name} /></div></Link><div className="p-6"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-small uppercase tracking-[0.1em] text-accent">{product.category}</p><Link href={`/catalog/${product._id}`}><h2 className="mt-3 font-heading text-h4 text-text-primary">{product.name}</h2></Link></div><WishlistButton item={{ productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl }} saved={savedIds.includes(product._id)} onChange={(saved) => setSavedIds((current) => saved ? [...current, product._id] : current.filter((id) => id !== product._id))} /></div><p className="mt-3 line-clamp-2 text-small text-text-secondary">{product.description}</p><div className="mt-5 flex items-center justify-between"><span className="font-mono text-small text-primary">${product.price.toFixed(2)}</span><span className="text-small text-text-secondary">{product.inventoryCount > 0 ? 'In stock' : 'Sold out'}</span></div></div></Card>)}</div><div className="mt-10 flex items-center justify-center gap-3 border-t border-border pt-5"><Button variant="secondary" size="sm" className="rounded-full px-5" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)}>Previous</Button><span className="min-w-24 text-center text-small text-text-secondary">Page {page} of {totalPages}</span><Button variant="secondary" size="sm" className="rounded-full px-5" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next</Button></div></>}
  </div>;
}
