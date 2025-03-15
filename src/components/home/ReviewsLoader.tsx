
import { Skeleton } from "@/components/ui/skeleton";

export const ReviewsLoader = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm h-[300px]">
          <Skeleton className="h-5 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/4 mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
