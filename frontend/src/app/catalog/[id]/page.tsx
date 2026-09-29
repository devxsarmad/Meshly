'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { MeshlyLoader } from '../../../components/ui/meshly-loader';
import { useAuth } from '../../../features/auth/auth-context';
import { addToCart } from '../../../features/cart/api';
import { listReviews, saveReview, type Review } from '../../../features/reviews/api';
import { getWishlist } from '../../../features/wishlist/api';
import { WishlistButton } from '../../../features/wishlist/components/wishlist-button';
import { getProduct, Product } from '../../../lib/api';
import { notify } from '../../../lib/toast';

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return <span className="font-mono tracking-wide text-accent" aria-label={`${rating.toFixed(1)} out of 5 stars`}>{'★'.repeat(rounded)}{'☆'.repeat(5 - rounded)}</span>;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => { if (!params.id) return; getProduct(params.id).then(setProduct).catch((reason: Error) => { setError(reason.message); notify('error', reason.message); }).finally(() => setLoading(false)); }, [params.id]);
  useEffect(() => { if (!params.id) return; setReviewsLoading(true); setReviewsError(''); listReviews(params.id).then(setReviews).catch((reason: Error) => setReviewsError(reason.message)).finally(() => setReviewsLoading(false)); }, [params.id]);
  useEffect(() => { if (!params.id || !user) { setSaved(false); return; } getWishlist().then((items) => setSaved(items.some((item) => item.productId === params.id))).catch(() => undefined); }, [params.id, user]);

  if (loading) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Loading product…" /></div>;
  if (error || !product) return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8"><Card className="text-center"><p className="text-error">{error || 'Product not found.'}</p><Link href="/catalog"><Button className="mt-5">Back to catalog</Button></Link></Card></div>;

  const currentProduct = product;
  const available = currentProduct.inventoryCount > 0;
  async function handleAddToCart() { setAdding(true); setCartMessage(''); try { await addToCart({ productId: currentProduct._id, name: currentProduct.name, price: currentProduct.price, quantity, imageUrl: currentProduct.imageUrl }); setCartMessage('Added to your cart.'); notify('success', `${currentProduct.name} added to your cart.`); } catch (reason) { const message = reason instanceof Error ? reason.message : 'Unable to add this item to your cart.'; setCartMessage(message); notify('error', message); } finally { setAdding(false); } }
  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setReviewSubmitting(true); try { const savedReview = await saveReview(currentProduct._id, { rating, comment }); const nextReviews = [savedReview, ...reviews.filter((review) => review.userId !== savedReview.userId)]; setReviews(nextReviews); setProduct((current) => current ? { ...current, averageRating: nextReviews.reduce((total, review) => total + review.rating, 0) / nextReviews.length, reviewCount: nextReviews.length } : current); setComment(''); notify('success', 'Your review was saved.'); } catch (reason) { notify('error', reason instanceof Error ? reason.message : 'Unable to save your review.'); } finally { setReviewSubmitting(false); } }
  async function reloadReviews() { setReviewsLoading(true); setReviewsError(''); try { setReviews(await listReviews(currentProduct._id)); } catch (reason) { setReviewsError(reason instanceof Error ? reason.message : 'Unable to load reviews.'); } finally { setReviewsLoading(false); } }

  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <Link href="/catalog" className="text-small text-text-secondary hover:text-primary">← Back to catalog</Link>
    <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
      <div className="flex aspect-square items-center justify-center rounded border border-border bg-primary/5">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded object-cover" /> : <span className="font-mono text-small uppercase tracking-[0.12em] text-text-secondary">Meshly / {product.category}</span>}</div>
      <div className="pt-2"><div className="flex items-start justify-between gap-4"><div><Badge tone="accent">{product.category}</Badge><h1 className="mt-6 font-heading text-h1">{product.name}</h1></div><WishlistButton item={{ productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl }} saved={saved} onChange={setSaved} /></div>{(product.reviewCount || 0) > 0 && <div className="mt-4 flex items-center gap-3 text-small"><Stars rating={product.averageRating || 0} /><span className="text-text-secondary">{product.averageRating?.toFixed(1)} · {product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'}</span></div>}<p className="mt-5 font-mono text-body text-primary">${product.price.toFixed(2)}</p><p className="mt-8 max-w-xl text-body text-text-secondary">{product.description}</p><div className="mt-8 border-y border-border py-6"><p className="text-small text-text-secondary">{available ? `${product.inventoryCount} available` : 'Currently unavailable'}</p><div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex items-center rounded border border-border"><button type="button" className="h-11 w-11 text-primary disabled:text-text-secondary" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={!available || quantity === 1} aria-label="Decrease quantity">−</button><span className="w-10 text-center font-mono text-small">{quantity}</span><button type="button" className="h-11 w-11 text-primary disabled:text-text-secondary" onClick={() => setQuantity((value) => Math.min(product.inventoryCount, value + 1))} disabled={!available || quantity >= product.inventoryCount} aria-label="Increase quantity">+</button></div><Button disabled={!available || adding} onClick={() => void handleAddToCart()}>{adding ? 'Adding…' : available ? 'Add to cart' : 'Sold out'}</Button></div>{cartMessage && <p className={`mt-4 text-small ${cartMessage === 'Added to your cart.' ? 'text-success' : 'text-error'}`} role="status">{cartMessage}{cartMessage === 'Added to your cart.' && <Link href="/cart" className="ml-2 underline underline-offset-4">View cart</Link>}</p>}</div><p className="mt-6 text-small text-text-secondary">Secure checkout and delivery details will be available in the next shopping-flow chunk.</p></div>
    </div>
    <section className="mt-section grid gap-8 border-t border-border pt-section lg:grid-cols-[0.8fr_1.2fr]"><div><Badge tone="accent">Customer notes</Badge><h2 className="mt-5 font-heading text-h2">What people think.</h2><p className="mt-4 text-body text-text-secondary">Share how this piece fits into your everyday life.</p>{user ? <form onSubmit={(event) => void handleReviewSubmit(event)} className="mt-8 space-y-4"><div><p className="text-small text-primary">Your rating</p><div className="mt-2 flex gap-1" role="radiogroup" aria-label="Choose a rating">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className={`text-2xl ${value <= rating ? 'text-accent' : 'text-border'}`} onClick={() => setRating(value)} aria-label={`${value} star${value === 1 ? '' : 's'}`} aria-pressed={value === rating}>★</button>)}</div></div><label className="block text-small text-primary">Your review<textarea value={comment} onChange={(event) => setComment(event.target.value)} required minLength={2} maxLength={1000} rows={5} className="mt-2 block w-full rounded border border-border bg-surface p-3 text-small text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" placeholder="What should other shoppers know?" /></label><Button type="submit" disabled={reviewSubmitting}>{reviewSubmitting ? 'Saving review…' : 'Save review'}</Button></form> : <p className="mt-8 text-small text-text-secondary">Sign in to leave a review.</p>}</div><Card><div className="flex items-center justify-between gap-4"><h2 className="font-heading text-h3">Reviews</h2>{(product.reviewCount || 0) > 0 && <div className="text-right"><Stars rating={product.averageRating || 0} /><p className="text-small text-text-secondary">{product.reviewCount} total</p></div>}</div>{reviewsLoading ? <MeshlyLoader label="Loading reviews…" /> : reviewsError ? <div className="mt-6"><p className="text-small text-error">{reviewsError}</p><Button size="sm" variant="secondary" className="mt-4" onClick={() => void reloadReviews()}>Try again</Button></div> : reviews.length === 0 ? <p className="mt-6 text-small text-text-secondary">No reviews yet. Be the first to share your experience.</p> : <div className="mt-6 divide-y divide-border">{reviews.map((review) => <article key={review._id} className="py-5 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-4"><p className="text-small text-primary">{review.userName}</p><Stars rating={review.rating} /></div><p className="mt-3 text-small text-text-secondary">{review.comment}</p><p className="mt-3 text-[11px] text-text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p></article>)}</div>}</Card></section>
  </div>;
}
