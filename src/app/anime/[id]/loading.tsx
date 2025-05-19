
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Tv, Film, Clapperboard, Info, List, ShieldQuestion } from 'lucide-react';

export default function AnimeDetailsLoading() {
  return (
    <div className="max-w-6xl mx-auto text-foreground">
      {/* Banner Skeleton */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full rounded-lg overflow-hidden shadow-2xl mb-[-80px] md:mb-[-120px]">
        <Skeleton className="h-full w-full bg-card/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <Card className="overflow-hidden shadow-xl bg-card border-border/50 relative z-10 mx-4 md:mx-8 lg:mx-auto">
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-[250px_1fr] gap-6 md:gap-8 items-start">
            {/* Left Column: Cover Image & Actions Skeleton */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <Skeleton className="w-[220px] h-[330px] rounded-lg shadow-lg bg-muted" />
              <Skeleton className="h-12 w-full bg-primary/50 rounded-md" />
            </div>

            {/* Right Column: Details Skeleton */}
            <div className="space-y-5">
              <Skeleton className="h-10 w-3/4 bg-muted rounded" />
              <Skeleton className="h-4 w-1/2 bg-muted rounded" />
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clapperboard className="w-4 h-4 mr-1.5 text-primary/50" />
                  <Skeleton className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1.5 text-primary/50" />
                  <Skeleton className="h-4 w-12 bg-muted rounded" />
                </div>
                <div className="flex items-center">
                  <ShieldQuestion className="w-4 h-4 mr-1.5 text-primary/50" />
                  <Skeleton className="h-6 w-20 bg-muted rounded-full" />
                </div>
                <div className="flex items-center">
                  <Tv className="w-4 h-4 mr-1.5 text-primary/50" />
                  <Skeleton className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-16 bg-muted/70 rounded-full" />
                  <Skeleton className="h-5 w-20 bg-muted/70 rounded-full" />
                  <Skeleton className="h-5 w-12 bg-muted/70 rounded-full" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center text-foreground/90">
                  <Info className="w-5 h-5 mr-2 text-primary/50"/> Synopsis
                </h2>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-muted rounded" />
                  <Skeleton className="h-4 w-full bg-muted rounded" />
                  <Skeleton className="h-4 w-5/6 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Skeleton className="h-px w-full my-6 bg-border/30" />
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-foreground/90">
              <List className="w-6 h-6 mr-2 text-primary/50"/> Episodes (<Skeleton className="inline-block h-6 w-8 bg-muted rounded" />)
            </h2>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 rounded-md border border-border/50 p-4 bg-background/50">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted/50 rounded-md" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
