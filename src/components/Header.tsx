
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Home, Menu, Film, UserCircle2 } from 'lucide-react';
import { Search as SearchIconLucide } from 'lucide-react'; // Renamed to avoid conflict
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import React, { useState } from 'react';
import { HeaderSearchBar } from './HeaderSearchBar';
import { AuthModal } from './AuthModal';
import { UserNav } from './UserNav';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Image
              src="/logo.png" // Assuming logo.png is in /public
              alt="Kiwi Anime Logo"
              width={140} // Adjust width as needed
              height={32} // Adjust height as needed
              className="h-8 w-auto" // Maintain aspect ratio, adjust height
              priority
              data-ai-hint="site logo anime"
            />
            {/* Kiwi Anime text removed */}
          </Link>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
            <HeaderSearchBar className="w-full max-w-xs lg:max-w-sm xl:max-w-md" />
            <nav className="flex items-center space-x-1">
              <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
                <Link href="/" className="text-sm font-medium transition-colors">
                  Home
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
                <Link href="/catalogue" className="text-sm font-medium transition-colors">
                  Catalogue
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-accent/50 hover:text-accent-foreground">
                <Link href="/search" className="text-sm font-medium transition-colors">
                  Browse All
                </Link>
              </Button>
            </nav>
            <div className="flex items-center">
              {!loading && user ? (
                <UserNav />
              ) : !loading ? (
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary-foreground"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              ) : (
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted"></div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden flex items-center space-x-2">
             {!loading && user ? (
                <UserNav />
              ) : !loading ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10 hover:text-primary-foreground"
                  onClick={() => setIsAuthModalOpen(true)}
                  aria-label="Log In"
                >
                  <UserCircle2 className="h-5 w-5" />
                </Button>
              ) : (
                <div className="h-9 w-9 animate-pulse rounded-full bg-muted"></div>
              )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-0 pt-6 flex flex-col">
                 <SheetHeader className="px-6">
                   <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
                    href="/catalogue"
                    className="text-lg font-medium hover:text-primary transition-colors flex items-center py-2"
                    onClick={closeMobileMenu}
                  >
                    <Film className="mr-3 h-5 w-5" /> Catalogue
                  </Link>
                  <Link
                    href="/search"
                    className="text-lg font-medium hover:text-primary transition-colors flex items-center py-2"
                    onClick={closeMobileMenu}
                  >
                    <SearchIconLucide className="mr-3 h-5 w-5" /> Browse All
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
}
