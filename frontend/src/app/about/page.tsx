import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge tone="accent">About Meshly</Badge>
          <h1 className="mt-6 max-w-3xl font-heading text-h1">
            Better things for everyday living.
          </h1>
          <p className="mt-6 max-w-xl text-body text-text-secondary">
            Meshly brings together well-made, useful products chosen for
            their quality, character, and lasting value.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog">
              <Button>Explore the catalog</Button>
            </Link>
            <Link href="/club">
              <Button variant="secondary">Discover Meshly Club</Button>
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
            <div>
              <dt className="font-mono text-small text-accent">01</dt>
              <dd className="mt-1 text-small text-text-secondary">Curated catalog</dd>
            </div>
            <div>
              <dt className="font-mono text-small text-accent">02</dt>
              <dd className="mt-1 text-small text-text-secondary">Member perks</dd>
            </div>
            <div>
              <dt className="font-mono text-small text-accent">03</dt>
              <dd className="mt-1 text-small text-text-secondary">Honest service</dd>
            </div>
          </dl>
        </div>

       <Card className="relative overflow-hidden border-none text-center">
  {/* base: diagonal navy-to-terracotta gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent" />

  {/* warm glow pooling toward the accent corner */}
  <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-hover/50 blur-3xl" />

  {/* cool counter-glow, opposite corner */}
  <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-primary-hover/60 blur-3xl" />

  {/* fine dot-grid texture */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.08]"
    style={{
      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
      backgroundSize: '18px 18px',
    }}
  />

  <div className="relative flex min-h-64 flex-col items-center justify-center gap-4 px-6">
    <span className="font-mono text-small uppercase tracking-wide text-white/70">
      Our approach
    </span>
    <p className="max-w-sm font-heading text-h2 text-white drop-shadow-sm">
      Thoughtful objects, chosen with purpose.
    </p>
  </div>
</Card>
      </section>

      <section className="grid gap-6 border-t border-border pt-section md:grid-cols-3">
        <Card className="transition-colors hover:border-accent">
          <p className="font-mono text-small text-accent">01</p>
          <h2 className="mt-4 font-heading text-h4">Quality first</h2>
          <p className="mt-3 text-small text-text-secondary">
            We look for dependable materials, thoughtful details, and
            products that earn their place in your home.
          </p>
        </Card>
        <Card className="transition-colors hover:border-accent">
          <p className="font-mono text-small text-accent">02</p>
          <h2 className="mt-4 font-heading text-h4">Simple service</h2>
          <p className="mt-3 text-small text-text-secondary">
            Clear choices, dependable delivery, and a straightforward
            experience from browsing to unboxing.
          </p>
        </Card>
        <Card className="transition-colors hover:border-accent">
          <p className="font-mono text-small text-accent">03</p>
          <h2 className="mt-4 font-heading text-h4">Made for you</h2>
          <p className="mt-3 text-small text-text-secondary">
            Your satisfaction matters, so every part of Meshly is built
            around helpful, human customer care.
          </p>
        </Card>
      </section>
    </div>
  );
}