
import { Skeleton } from "@/components/ui/skeleton";

export default function ListPageLoading() {
  return (
    <div className="py-8">
      <Skeleton className="h-10 w-1/2 md:w-1/3 mx-auto mb-8 bg-muted" />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-lg bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
            <Skeleton className="h-3 w-1/2 bg-muted" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-4 py-8">
        <Skeleton className="h-10 w-24 bg-muted" />
        <Skeleton className="h-6 w-20 bg-muted" />
        <Skeleton className="h-10 w-24 bg-muted" />
      </div>
    </div>
  );
}

