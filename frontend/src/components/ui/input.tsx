import type { InputHTMLAttributes } from 'react';
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={`h-11 w-full rounded border border-border bg-surface px-3 text-body text-text-primary outline-none placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent ${className}`} {...props} />; }
