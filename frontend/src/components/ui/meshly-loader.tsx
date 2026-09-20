import { MeshlyMark } from './meshly-mark';

export function MeshlyLoader({ label = 'Loading Meshly…' }: { label?: string }) {
  return <div className="flex flex-col items-center justify-center gap-4 py-16 text-center text-text-secondary" role="status" aria-live="polite"><MeshlyMark size="md" className="animate-pulse" /><span className="text-small">{label}</span></div>;
}
