'use client';

import Link from 'next/link';
import { ChevronDown, ChevronUp, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../features/auth/auth-context';
import { Button } from '../ui/button';

const navItem = (active: boolean) => [
  'border-b-2 py-1 transition-colors',
  active ? 'border-accent text-primary' : 'border-transparent text-text-secondary hover:border-accent hover:text-primary',
].join(' ');

export function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="font-heading text-h3 text-primary">
          Meshly<span className="text-accent">.</span>
        </Link>
        <nav className="hidden items-center gap-7 text-small md:flex">
          <Link href="/catalog" className={navItem(pathname.startsWith('/catalog'))}>Catalog</Link>
          <Link href="/cart" className={navItem(pathname === '/cart')}>Cart</Link>
          <Link href="/#about" className={navItem(pathname === '/')}>About</Link>
          {!loading && (user ? (
            <div className="relative">
              <button type="button" className="inline-flex items-center justify-center rounded border border-transparent p-2 text-primary transition-colors hover:border-accent hover:text-accent" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open account menu">
                <UserRound size={21} strokeWidth={1.8} aria-hidden="true" />
                {open ? <ChevronUp size={15} strokeWidth={2} aria-hidden="true" /> : <ChevronDown size={15} strokeWidth={2} aria-hidden="true" />}
              </button>
              {open && <div className="absolute left-0 top-11 z-10 w-52 rounded border border-border bg-surface p-2 shadow-subtle">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-small text-primary">{user.name || 'Meshly customer'}</p>
                  <p className="truncate text-[11px] text-text-secondary">{user.email}</p>
                </div>
                <span className="block px-3 py-2 text-small text-text-secondary">Account coming soon</span>
                <button type="button" className="block w-full rounded px-3 py-2 text-left text-small text-error transition-colors hover:bg-background" onClick={() => { setOpen(false); void signOut(); }}>Sign out</button>
              </div>}
            </div>
          ) : <Link href="/auth/sign-in"><Button size="sm" variant="secondary">Sign in</Button></Link>)}
        </nav>
        {!loading && (user ? <button type="button" className="text-small text-primary md:hidden" onClick={() => void signOut()}>Sign out</button> : <Link href="/auth/sign-in" className="md:hidden"><Button size="sm" variant="ghost">Sign in</Button></Link>)}
      </div>
    </header>
  );
}
