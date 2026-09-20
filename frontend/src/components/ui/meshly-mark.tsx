type MeshlyMarkProps = { className?: string; size?: 'sm' | 'md' | 'lg' };

const sizes = { sm: 'h-6 w-6', md: 'h-9 w-9', lg: 'h-12 w-12' };

export function MeshlyMark({ className = '', size = 'md' }: MeshlyMarkProps) {
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-[30%] bg-primary text-background ${sizes[size]} ${className}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" className="h-[68%] w-[68%]"><path d="M4 17V7l4 3 4-3 4 3 4-3v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="4" cy="19" r="1.3" fill="currentColor" /><circle cx="20" cy="19" r="1.3" fill="currentColor" /></svg></span>;
}
