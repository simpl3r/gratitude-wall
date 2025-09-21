import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gratitude Wall - Daily Check-in',
  description: 'Share what you are grateful for every day on Base blockchain',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Gratitude Wall - Daily Check-in',
    description: 'Share what you are grateful for every day on Base blockchain',
    type: 'website',
    images: ['/icon-512.png'],
  },
  twitter: {
    card: 'summary',
    title: 'Gratitude Wall - Daily Check-in',
    description: 'Share what you are grateful for every day on Base blockchain',
    images: ['/icon-512.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Gratitude Wall',
    'application-name': 'Gratitude Wall',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}