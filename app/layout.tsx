import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NeighborShield AI — Check suspicious messages',
  description: 'Upload a screenshot or paste a message to spot scam and phishing warning signs in plain language.',
  openGraph: {
    title: 'NeighborShield AI',
    description: 'A calm second opinion for suspicious messages.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'NeighborShield AI — A calm second opinion for suspicious messages.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeighborShield AI',
    description: 'A calm second opinion for suspicious messages.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
