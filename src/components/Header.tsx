import Link from 'next/link';
import { Tv2, Home, Search, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from './ui/separator';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Tv2 className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">
            AniWave Lite
          </span>
        </Link>
        <nav className="flex flex-1 items-center space-x-2 sm:space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              <Home className="mr-2 h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/search" className="text-sm font-medium transition-colors hover:text-primary">
              <Search className="mr-2 h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/suggest" className="text-sm font-medium transition-colors hover:text-primary">
              <Wand2 className="mr-2 h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">AI Suggester</span>
            </Link>
          </Button>
        </nav>
        {/* Placeholder for future elements like theme toggle or user profile */}
      </div>
      <Separator />
    </header>
  );
}
