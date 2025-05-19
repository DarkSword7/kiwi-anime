
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  basePath: string; 
  currentQuery?: string; // To preserve other filters
  totalPages?: number; 
  onPageChange?: (page: number) => void; // Callback for client-side navigation
}

export function PaginationControls({
  currentPage,
  hasNextPage,
  basePath,
  currentQuery = "",
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const buildLink = (page: number) => {
    const params = new URLSearchParams(currentQuery);
    params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4 py-8">
      <Button 
        asChild={!onPageChange} 
        variant="outline" 
        disabled={currentPage <= 1} 
        className="border-primary/30 text-primary hover:bg-primary/10 px-3 sm:px-4 py-2 h-auto text-sm"
        onClick={onPageChange ? () => onPageChange(prevPage) : undefined}
      >
        {onPageChange && currentPage > 1 ? (
          <>
            <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
            Previous
          </>
        ) : (
          <Link href={buildLink(prevPage)} scroll={false}>
            <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4" />
            Previous
          </Link>
        )}
      </Button>

      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Page {currentPage} {totalPages ? `of ${totalPages}` : ''}
      </span>

      <Button 
        asChild={!onPageChange} 
        variant="outline" 
        disabled={!hasNextPage} 
        className="border-primary/30 text-primary hover:bg-primary/10 px-3 sm:px-4 py-2 h-auto text-sm"
        onClick={onPageChange ? () => onPageChange(nextPage) : undefined}
      >
         {onPageChange && hasNextPage ? (
          <>
            Next
            <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
          </>
        ) : (
          <Link href={buildLink(nextPage)} scroll={false}>
            Next
            <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}
