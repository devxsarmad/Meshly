'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';

export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput({ className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <input ref={ref} type={visible ? 'text' : 'password'} className={`h-11 w-full rounded border border-border bg-surface px-3 pr-11 text-body text-text-primary outline-none placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent ${className}`} {...props} />
    <button type="button" onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-secondary hover:text-primary" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
      {visible ? <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.5A10.7 10.7 0 0 1 12 4.3c5.2 0 8.6 4.4 9.7 6.1.2.3.2.7 0 1a15 15 0 0 1-3.2 3.5M6.2 6.2A15.6 15.6 0 0 0 2.3 10.4c-.2.3-.2.7 0 1C3.4 13.1 6.8 17.5 12 17.5c1 0 1.9-.2 2.8-.5" /></svg> : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8"><path d="M2.3 11.4C3.4 9.7 6.8 5.3 12 5.3s8.6 4.4 9.7 6.1c.2.3.2.7 0 1-1.1 1.7-4.5 6.1-9.7 6.1s-8.6-4.4-9.7-6.1a.9.9 0 0 1 0-1Z" /><circle cx="12" cy="12" r="2.7" /></svg>}
    </button>
  </div>;
});
