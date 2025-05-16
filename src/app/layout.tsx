import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";

// Removed incorrect GeistSans() and GeistMono() function calls.
// The `GeistSans` and `GeistMono` imports are objects, and we use their `.variable` property.

export const metadata: Metadata = {
  title: 'AniWave Lite - Your Anime Companion',
  description: 'Discover, search, and get AI suggestions for anime.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      {/*
        The `GeistSans.variable` and `GeistMono.variable` are applied to the <html> tag.
        This makes CSS variables like --font-geist-sans available.
        The `globals.css` file already applies `font-family: var(--font-geist-sans)` to the body.
        The `font-sans` class on the body tag ensures Tailwind's typography utilities work as expected.
      */}
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
