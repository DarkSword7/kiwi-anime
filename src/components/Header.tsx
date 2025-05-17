
"use client";

import Link from 'next/link';
import { Kiwi, Home, Search as SearchIcon, Menu } from 'lucide-react'; // Removed Wand2
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-7 w-7">
            <path d="M15.34 10.66a4 4 0 1 0-8.54-3.38"/>
            <path d="M8.43 10.08c-.19.64-.23 1.4.13 2.19A4 4 0 0 0 16.71 8.7"/>
            <path d="m10.5 10.5-2.02 2.02"/>
            <path d="M13.5 13.5 16 16"/>
            <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"/>
            <path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
            <path d="M15 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
            <path d="M9 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
          </svg>
          <span className="font-bold sm:inline-block text-xl text-foreground">
            Kiwi Anime
          </span>
        </Link>

        {/* Desktop Navigation & Search */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs lg:max-w-sm xl:max-w-md mr-4">
            <Input
              type="search"
              placeholder="Search anime..."
              className="h-9 pl-8 pr-4 text-sm bg-input border-border focus:bg-background focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </form>
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
              <Link href="/" className="text-sm font-medium transition-colors">
                Home
              </Link>
            </Button>
            <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
              <Link href="/search" className="text-sm font-medium transition-colors">
                Search
              </Link>
            </Button>
            {/* Removed AI Suggester Link */}
          </nav>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6">
              <nav className="flex flex-col space-y-4 mt-6">
                 <form onSubmit={handleSearchSubmit} className="relative w-full mb-4">
                    <Input
                      type="search"
                      placeholder="Search anime..."
                      className="h-9 pl-8 pr-4 text-sm bg-input border-border focus:bg-background focus:border-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </form>
                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors flex items-center">
                  <Home className="mr-2 h-5 w-5" /> Home
                </Link>
                <Link href="/search" className="text-lg font-medium hover:text-primary transition-colors flex items-center">
                  <SearchIcon className="mr-2 h-5 w-5" /> Search
                </Link>
                {/* Removed AI Suggester Link from Mobile Menu */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
