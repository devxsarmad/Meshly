import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return <div className="mx-auto max-w-6xl px-6 py-section lg:px-8">
    <section className="grid gap-12 border-b border-border pb-section lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
      <div><Badge tone="accent">The Meshly edit</Badge><h1 className="mt-6 max-w-3xl font-heading text-h1">Better things for everyday living.</h1><p className="mt-6 max-w-xl text-body text-text-secondary">Meshly brings together well-made, useful products chosen for their quality, character, and lasting value.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/catalog"><Button>Explore the catalog</Button></Link><a href="#about"><Button variant="secondary">Why shop Meshly</Button></a></div></div>
      <Card className="!bg-primary !text-white"><p className="font-mono text-small uppercase tracking-[0.16em] text-white/70">Our promise / 001</p><p className="mt-8 font-heading text-h3 text-white">Thoughtfully chosen, made to last.</p><p className="mt-4 text-small text-white/75">We make everyday shopping feel simpler by focusing on products worth bringing home.</p></Card>
    </section>
    <section id="about" className="grid gap-6 pt-section md:grid-cols-3"><Card><p className="font-mono text-small text-accent">01</p><h2 className="mt-4 font-heading text-h4">Quality first</h2><p className="mt-3 text-small text-text-secondary">We look for dependable materials, thoughtful details, and products that earn their place in your home.</p></Card><Card><p className="font-mono text-small text-accent">02</p><h2 className="mt-4 font-heading text-h4">Simple service</h2><p className="mt-3 text-small text-text-secondary">Clear choices, dependable delivery, and a straightforward experience from browsing to unboxing.</p></Card><Card><p className="font-mono text-small text-accent">03</p><h2 className="mt-4 font-heading text-h4">Made for you</h2><p className="mt-3 text-small text-text-secondary">Your satisfaction matters, so we build every part of Meshly around helpful, human customer care.</p></Card></section>
  </div>;
}
