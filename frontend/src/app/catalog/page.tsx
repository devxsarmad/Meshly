'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { getProducts, Product } from '../../lib/api';

const categories = ['All', 'Home', 'Workspace', 'Kitchen', 'Travel'];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProducts({ search: submittedSearch, category })
      .then((items) => { if (active) setProducts(items); })
      .catch((reason: Error) => { if (active) setError(reason.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [submittedSearch, category, retryKey]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(search.trim());
  }

  return <div id="catalog" className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <div className="max-w-2xl"><Badge tone="accent">The collection</Badge><h1 className="mt-6 font-heading text-h1">Objects worth keeping.</h1><p className="mt-5 text-body text-text-secondary">Browse a considered collection of useful things, selected for everyday living.</p></div>
    <div className="mt-10 flex flex-col gap-4 border-y border-border py-5 md:flex-row md:items-center md:justify-between">
      <form onSubmit={submitSearch} className="flex w-full max-w-md gap-2"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" /><Button type="submit" variant="secondary">Search</Button></form>
      <div className="flex flex-wrap gap-2" aria-label="Product categories">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`rounded px-3 py-2 text-small ${category === item ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary/10 hover:text-primary'}`}>{item}</button>)}</div>
    </div>
    {loading && <p className="py-16 text-center text-text-secondary">Loading the collection…</p>}
    {!loading && error && <Card className="mt-10 border-error/30 bg-error/5 text-center"><p className="text-error">{error}</p><Button className="mt-5" onClick={() => setRetryKey((value) => value + 1)}>Try again</Button></Card>}
    {!loading && !error && products.length === 0 && <p className="py-16 text-center text-text-secondary">No products match this collection yet.</p>}
    {!loading && !error && products.length > 0 && <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <Link href={`/catalog/${product._id}`} key={product._id}><Card className="h-full overflow-hidden p-0 transition-shadow hover:shadow-md"><div className="flex aspect-[4/3] items-center justify-center bg-primary/5">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <span className="font-mono text-small uppercase tracking-[0.12em] text-text-secondary">Meshly / {product.category}</span>}</div><div className="p-6"><p className="font-mono text-small uppercase tracking-[0.1em] text-accent">{product.category}</p><h2 className="mt-3 font-heading text-h4 text-text-primary">{product.name}</h2><p className="mt-3 line-clamp-2 text-small text-text-secondary">{product.description}</p><div className="mt-5 flex items-center justify-between"><span className="font-mono text-small text-primary">${product.price.toFixed(2)}</span><span className="text-small text-text-secondary">{product.inventoryCount > 0 ? 'In stock' : 'Sold out'}</span></div></div></Card></Link>)}</div>}
  </div>;
}
