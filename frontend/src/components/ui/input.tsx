import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`h-11 w-full rounded border border-border bg-surface px-3 text-body text-text-primary outline-none placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent ${className}`} {...props} />;
});
