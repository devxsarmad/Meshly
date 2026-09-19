import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' };
const variants: Record<ButtonVariant, string> = { primary: 'bg-accent text-surface hover:bg-accent-hover', secondary: 'border border-primary bg-transparent text-primary hover:bg-primary hover:text-surface', ghost: 'text-primary hover:text-accent' };
const sizes: Record<NonNullable<ButtonProps['size']>, string> = { sm: 'h-9 px-3 text-small', md: 'h-11 px-5 text-small', lg: 'h-[52px] px-6 text-body' };
export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) { return <button className={`inline-flex items-center justify-center rounded font-body font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`} {...props} />; }
