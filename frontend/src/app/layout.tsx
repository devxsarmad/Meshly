import type { Metadata } from 'next';
import { Footer } from '../components/layout/footer';
import { Header } from '../components/layout/header';
import '../styles/globals.css';

export const metadata: Metadata = { title: 'Meshly', description: 'A considered marketplace for everyday objects.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>;
}
