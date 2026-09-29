'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { useAuth } from '../../auth/auth-context';
import { addToWishlist, removeFromWishlist } from '../api';
import { notify } from '../../../lib/toast';

type WishlistButtonProps = { item: { productId: string; name: string; price: number; imageUrl?: string }; saved?: boolean; onChange?: (saved: boolean) => void };

export function WishlistButton({ item, saved = false, onChange }: WishlistButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(saved);
  const [busy, setBusy] = useState(false);
  useEffect(() => setIsSaved(saved), [saved]);
  async function toggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!user) { notify('info', 'Sign in to save items to your wishlist.'); return; }
    setBusy(true);
    try { if (isSaved) await removeFromWishlist(item.productId); else await addToWishlist(item); const next = !isSaved; setIsSaved(next); onChange?.(next); notify('success', next ? 'Added to your wishlist.' : 'Removed from your wishlist.'); } catch (reason) { notify('error', reason instanceof Error ? reason.message : 'Unable to update your wishlist.'); } finally { setBusy(false); }
  }
  return <button type="button" onClick={(event) => void toggle(event)} disabled={busy} aria-label={isSaved ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`} aria-pressed={isSaved} className={`inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 ${isSaved ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-accent hover:text-accent'}`}><Heart size={18} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.8} aria-hidden="true" /></button>;
}
