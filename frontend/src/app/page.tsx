import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function HomePage() {
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <section className="grid gap-12 border-b border-border pb-section lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
      <div><Badge tone="accent">The Meshly foundation</Badge><h1 className="mt-6 max-w-3xl font-heading text-h1">Objects with a point of view.</h1><p className="mt-6 max-w-xl text-body text-text-secondary">A warm, deliberate foundation for the Meshly storefront. The catalog, cart, checkout, and account experiences will grow from these reusable primitives.</p><div className="mt-8 flex flex-wrap gap-3"><Button>Explore the catalog</Button><Button variant="secondary">View the system</Button></div></div>
      <Card className="bg-primary text-surface"><p className="font-mono text-small uppercase tracking-[0.16em] text-surface/70">Foundation / 001</p><p className="mt-8 font-heading text-h3">Made for clarity, built to last.</p><p className="mt-4 text-small text-surface/75">A distinctive visual language without unnecessary noise.</p></Card>
    </section>
    <section className="grid gap-6 pt-section md:grid-cols-3"><Card><p className="font-mono text-small text-accent">01</p><h2 className="mt-4 font-heading text-h4">Considered</h2><p className="mt-3 text-small text-text-secondary">Editorial typography and a tactile palette create a clear point of view.</p></Card><Card><p className="font-mono text-small text-accent">02</p><h2 className="mt-4 font-heading text-h4">Useful</h2><p className="mt-3 text-small text-text-secondary">Every component starts with hierarchy, readability, and purposeful interaction.</p></Card><Card><p className="font-mono text-small text-accent">03</p><h2 className="mt-4 font-heading text-h4">Human</h2><p className="mt-3 text-small text-text-secondary">Small details and restrained motion leave room for the products to speak.</p></Card></section>
  </div>;
}
