'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { registerAccount, saveSession, signIn } from '../../../lib/api';
import { AuthFormValues, registerSchema, signInSchema } from '../schemas';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { PasswordInput } from '../../../components/ui/password-input';

export function AuthForm({ mode }: { mode: 'sign-in' | 'register' }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [serverError, setServerError] = useState('');
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(isRegister ? registerSchema : signInSchema) as Resolver<AuthFormValues>,
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  async function submit(values: AuthFormValues) {
    setServerError('');
    try {
      const session = isRegister
        ? await registerAccount(values.email, values.password, values.name || '')
        : await signIn(values.email, values.password);
      saveSession(session);
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next?.startsWith('/') ? next : '/catalog');
    } catch (reason) {
      setServerError(reason instanceof Error ? reason.message : 'Unable to complete authentication.');
    }
  }

  return <Card className="mx-auto w-full max-w-md p-8"><div className="text-center"><p className="font-mono text-small uppercase tracking-[0.12em] text-accent">Meshly account</p><h1 className="mt-4 font-heading text-h2">{isRegister ? 'Create your account.' : 'Welcome back.'}</h1><p className="mt-3 text-small text-text-secondary">{isRegister ? 'Save your details for a smoother checkout.' : 'Sign in to continue shopping.'}</p></div><form onSubmit={handleSubmit(submit)} noValidate className="mt-8 space-y-5">{isRegister && <label className="block text-small text-primary">Name<Input {...register('name')} autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name && <span className="mt-1 block text-small text-error">{errors.name.message}</span>}</label>}<label className="block text-small text-primary">Email<Input {...register('email')} type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email && <span className="mt-1 block text-small text-error">{errors.email.message}</span>}</label><label className="block text-small text-primary">Password<PasswordInput {...register('password')} minLength={8} autoComplete={isRegister ? 'new-password' : 'current-password'} aria-invalid={Boolean(errors.password)} />{errors.password && <span className="mt-1 block text-small text-error">{errors.password.message}</span>}</label>{serverError && <p role="alert" className="text-small text-error">{serverError}</p>}<Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Working…' : isRegister ? 'Create account' : 'Sign in'}</Button></form><p className="mt-6 text-center text-small text-text-secondary">{isRegister ? 'Already have an account? ' : 'New to Meshly? '}<Link href={isRegister ? '/auth/sign-in' : '/auth/register'} className="text-primary underline underline-offset-4">{isRegister ? 'Sign in' : 'Create an account'}</Link></p></Card>;
}
