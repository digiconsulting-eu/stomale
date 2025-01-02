import { Skeleton } from "@/components/ui/skeleton";

export const ReviewLoader = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/4 mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
};