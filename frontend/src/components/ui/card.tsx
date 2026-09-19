import type { HTMLAttributes } from 'react';
export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={`rounded border border-border bg-surface p-6 shadow-subtle ${className}`} {...props} />; }
