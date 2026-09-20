'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { getSession } from '../../../lib/api';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (getSession()) {
      setAuthorized(true);
      return;
    }
    router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  if (!authorized) return <div className="mx-auto max-w-6xl px-6 py-section text-center text-text-secondary lg:px-8">Checking your session…</div>;
  return children;
}
