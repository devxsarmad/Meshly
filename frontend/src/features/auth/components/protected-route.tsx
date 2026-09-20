'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../auth-context';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      setAuthorized(true);
      return;
    }
    router.replace(`/auth/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [loading, pathname, router, user]);

  if (loading || !authorized) return <div className="mx-auto max-w-6xl px-6 py-section text-center text-text-secondary lg:px-8">Checking your session…</div>;
  return children;
}
