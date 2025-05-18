
"use client";

import Link from 'next/link';
import { Home, Menu, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon import
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import React, { useState } from 'react';
import { HeaderSearchBar } from './HeaderSearchBar'; 

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2" onClick={closeMobileMenu}>
          {/* Using a simple SVG for Kiwi icon as requested */}
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
          <HeaderSearchBar className="w-full max-w-xs lg:max-w-sm xl:max-w-md mr-4" />
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
              <Link href="/" className="text-sm font-medium transition-colors">
                Home
              </Link>
            </Button>
            <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
              <Link href="/search" className="text-sm font-medium transition-colors">
                Browse All
              </Link>
            </Button>
          </nav>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 pt-6 flex flex-col">
              <SheetHeader className="px-6">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle> {/* Added for accessibility */}
              </SheetHeader>
              <div className="px-6 mb-4">
                <HeaderSearchBar onSearchSubmit={closeMobileMenu} />
              </div>
              <nav className="flex flex-col space-y-2 flex-grow px-6">
                <Link 
                  href="/" 
                  className="text-lg font-medium hover:text-primary transition-colors flex items-center py-2"
                  onClick={closeMobileMenu}
                >
                  <Home className="mr-3 h-5 w-5" /> Home
                </Link>
                <Link 
                  href="/search" 
                  className="text-lg font-medium hover:text-primary transition-colors flex items-center py-2"
                  onClick={closeMobileMenu}
                >
                  <SearchIcon className="mr-3 h-5 w-5" /> Browse All 
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
