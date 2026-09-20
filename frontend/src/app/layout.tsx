import type { Metadata } from 'next';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';
import { AuthProvider } from '../features/auth/auth-context';
import '../styles/globals.css';

export const metadata: Metadata = { title: 'Meshly', description: 'A considered marketplace for everyday objects.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AuthProvider><Header /><main>{children}</main><Footer /></AuthProvider></body></html>;
}
