import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";

// Vidstack styles
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';


export const metadata: Metadata = {
  title: 'Kiwi Anime - Your Anime Companion',
  description: 'Discover, search, and get AI suggestions for anime with Kiwi Anime.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className={`font-sans antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Script
          id="adsterra-popunder"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '//pl26673537.profitableratecpm.com/dc/a9/24/dca92418362de52e71b2416a719f9fd5.js';
                document.body.appendChild(script);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
