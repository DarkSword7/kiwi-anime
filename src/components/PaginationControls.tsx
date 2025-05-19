
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  basePath: string; // e.g., /list/popular
  totalPages?: number; // Optional, if available
}

export function PaginationControls({
  currentPage,
  hasNextPage,
  basePath,
  totalPages,
}: PaginationControlsProps) {
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <div className="flex items-center justify-center space-x-4 py-8">
      <Button asChild variant="outline" disabled={currentPage <= 1} className="border-primary/30 text-primary hover:bg-primary/10">
        <Link href={`${basePath}?page=${prevPage}`} scroll={false}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Link>
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} {totalPages ? `of ${totalPages}` : ''}
      </span>

      <Button asChild variant="outline" disabled={!hasNextPage} className="border-primary/30 text-primary hover:bg-primary/10">
        <Link href={`${basePath}?page=${nextPage}`} scroll={false}>
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

