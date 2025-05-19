
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CatalogueLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-1/4 mb-2 bg-muted" /> {/* Breadcrumbs */}
      <Skeleton className="h-12 w-1/3 mb-6 bg-muted" /> {/* Title */}
      <Skeleton className="h-12 w-full mb-8 bg-muted" /> {/* Search bar */}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
        {/* Main Content Area Skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="bg-card/80 border-border/30 overflow-hidden">
                <CardHeader className="p-0">
                  <Skeleton className="aspect-video w-full bg-muted" />
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-muted" />
                  <Skeleton className="h-4 w-1/2 bg-muted" />
                  <Skeleton className="h-10 w-full bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Pagination Skeleton */}
          <div className="flex items-center justify-center space-x-4 py-8">
            <Skeleton className="h-10 w-24 bg-muted" />
            <Skeleton className="h-6 w-20 bg-muted" />
            <Skeleton className="h-10 w-24 bg-muted" />
          </div>
        </div>

        {/* Filter Sidebar Skeleton */}
        <aside className="w-full md:w-[300px] space-y-6">
          <Card className="bg-card/80 border-border/30 p-4">
            <Skeleton className="h-6 w-1/3 mb-4 bg-muted" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full bg-muted" />)}
            </div>
          </Card>
          <Card className="bg-card/80 border-border/30 p-4">
            <Skeleton className="h-6 w-1/3 mb-4 bg-muted" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full bg-muted" />)}
            </div>
          </Card>
          <Skeleton className="h-10 w-full bg-primary/50" />
          <Skeleton className="h-10 w-full bg-muted" />
        </aside>
      </div>
    </div>
  );
}
