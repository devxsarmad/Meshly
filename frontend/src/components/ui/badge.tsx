type BadgeTone = 'accent' | 'success' | 'neutral';
const tones: Record<BadgeTone, string> = { accent: 'bg-accent/10 text-accent', success: 'bg-success/10 text-success', neutral: 'bg-primary/10 text-primary' };
export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: BadgeTone }) { return <span className={`inline-flex rounded px-2.5 py-1 font-mono text-small font-medium uppercase tracking-[0.08em] ${tones[tone]}`}>{children}</span>; }
