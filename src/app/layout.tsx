
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { InitialLoadingAnimation } from '@/components/InitialLoadingAnimation'; // Import the new component

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
      <head>
        {/* RichAds script removed */}
      </head>
      <body className={`font-sans antialiased flex flex-col min-h-screen bg-background text-foreground`}>
        <InitialLoadingAnimation /> {/* Add the animation component here */}
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
