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
  title: 'TechGate — AI-powered protection against digital scams',
  description: 'Upload a screenshot or paste a message to spot scam and phishing warning signs in plain language.',
  openGraph: {
    title: 'TechGate — AI-powered protection against digital scams',
    description: 'Upload a screenshot or paste a message to spot scam and phishing warning signs in plain language.',
    images: [{ url: '/og.png', width: 1672, height: 941, alt: 'TechGate — AI-powered protection against digital scams.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechGate — AI-powered protection against digital scams',
    description: 'Upload a screenshot or paste a message to spot scam and phishing warning signs in plain language.',
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
