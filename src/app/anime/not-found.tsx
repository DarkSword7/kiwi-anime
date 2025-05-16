import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 min-h-[60vh]">
      <AlertTriangle className="w-24 h-24 text-destructive" />
      <h1 className="text-4xl font-bold">Anime Not Found</h1>
      <p className="text-xl text-muted-foreground">
        Oops! We couldn't find the anime you were looking for.
      </p>
      <p className="text-muted-foreground">
        It might have been removed, or the ID is incorrect.
      </p>
      <div className="flex space-x-4">
        <Button asChild variant="default">
          <Link href="/">Go to Homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Search Anime</Link>
        </Button>
      </div>
    </div>
  );
}
