'use client';

import { useState } from 'react';

type ProductImageProps = {
  src?: string;
  alt: string;
  className?: string;
};

function LoadingDots() {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.2s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-accent" />
    </div>
  );
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [loading, setLoading] = useState(Boolean(src));
  const [failed, setFailed] = useState(!src);

  if (failed || !src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-primary/5 ${className}`} aria-label={`${alt} image unavailable`}>
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-primary/5 ${className}`}>
      {loading && <div className="absolute inset-0 flex items-center justify-center" aria-label={`Loading ${alt}`}><LoadingDots /></div>}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setFailed(true); }}
      />
    </div>
  );
}
