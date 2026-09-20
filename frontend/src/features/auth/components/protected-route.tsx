'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '../auth-context';
import { MeshlyLoader } from '../../../components/ui/meshly-loader';

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

  if (loading || !authorized) return <div className="mx-auto max-w-6xl px-6 lg:px-8"><MeshlyLoader label="Checking your session…" /></div>;
  return children;
}
