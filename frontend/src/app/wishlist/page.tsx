"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { MeshlyLoader } from "../../components/ui/meshly-loader";
import { ProtectedRoute } from "../../features/auth/components/protected-route";
import { addToCart } from "../../features/cart/api";
import {
  getWishlist,
  removeFromWishlist,
  type WishlistItem,
} from "../../features/wishlist/api";
import { WishlistButton } from "../../features/wishlist/components/wishlist-button";
import { ProductImage } from "../../components/ui/product-image";
import { notify } from "../../lib/toast";

function WishlistContent() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch((reason: Error) => {
        setError(reason.message);
        notify("error", reason.message);
      })
      .finally(() => setLoading(false));
  }, []);
  async function moveToCart(item: WishlistItem) {
    setBusyId(item.productId);
    try {
      await addToCart({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      });
      await removeFromWishlist(item.productId);
      setItems((current) =>
        current.filter((saved) => saved.productId !== item.productId),
      );
      notify("success", `${item.name} added to your cart.`);
    } catch (reason) {
      notify(
        "error",
        reason instanceof Error
          ? reason.message
          : "Unable to add this item to your cart.",
      );
    } finally {
      setBusyId("");
    }
  }
  return (
    <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
      <div className="max-w-2xl">
        <Badge tone="accent">Saved for later</Badge>
        <h1 className="mt-6 font-heading text-h1">Your wishlist.</h1>
        <p className="mt-5 text-body text-text-secondary">
          Keep the things you love close until you are ready to bring them home.
        </p>
      </div>
      {loading && <MeshlyLoader label="Loading your wishlist…" />}
      {!loading && error && (
        <Card className="mt-10 border-error/30 bg-error/5">
          <p className="text-error">{error}</p>
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </Card>
      )}
      {!loading && !error && items.length === 0 && (
        <Card className="mt-10 text-center">
          <h2 className="font-heading text-h3">Nothing saved yet.</h2>
          <p className="mt-3 text-text-secondary">
            Save products from the catalog and they will appear here.
          </p>
          <Link href="/catalog">
            <Button className="mt-6">Explore the catalog</Button>
          </Link>
        </Card>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.productId} className="flex flex-col p-0">
              <div className="relative">
                <Link href={`/catalog/${item.productId}`} className="block">
                  <div className="flex aspect-[4/3] items-center justify-center rounded-t bg-primary/5">
                    <ProductImage src={item.imageUrl} alt={item.name} className="rounded-t" />
                  </div>
                </Link>
                <WishlistButton item={item} saved onChange={(saved) => { if (!saved) setItems((current) => current.filter((savedItem) => savedItem.productId !== item.productId)); }} className="absolute right-3 top-3 z-10 bg-surface/95" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/catalog/${item.productId}`}>
                      <h2 className="font-heading text-h4 text-text-primary">
                        {item.name}
                      </h2>
                    </Link>
                    <p className="mt-2 font-mono text-small text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  className="mt-6 w-full"
                  disabled={busyId === item.productId}
                  onClick={() => void moveToCart(item)}
                >
                  {busyId === item.productId ? "Adding…" : "Add to cart"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}
