
"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export function InitialLoadingAnimation() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800); // Adjust delay as needed

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background text-primary space-y-6 p-4 transition-opacity duration-500 ease-in-out">
      <Image
        src="/logo.png"
        alt="Kiwi Anime Logo"
        width={200}
        height={45} 
        className="h-12 w-auto mb-4 animate-pulse"
        priority
        data-ai-hint="site logo anime"
      />
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-lg font-medium text-foreground/80">Loading Kiwi Anime...</p>
    </div>
  );
}
