
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

interface ReviewsSectionProps {
  latestReviews: any[] | null | undefined;
  isLoading: boolean;
}

export const ReviewsSection = ({ latestReviews, isLoading }: ReviewsSectionProps) => {
  return (
    <section className="py-16 bg-gray-50 overflow-visible">
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-primary relative">
            <span className="relative z-10">Recensioni in evidenza</span>
            <span className="absolute -bottom-2 left-0 w-12 h-1.5 bg-blue-200 rounded-full"></span>
          </h2>
          <Link to="/recensioni" className="group">
            <Button variant="outline" className="border-2 border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2">
              Tutte le recensioni
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
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
        ) : !latestReviews || latestReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-4">Non ci sono ancora recensioni approvate.</p>
            <div className="flex flex-col gap-4 items-center">
              <Link to="/nuova-recensione">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Scrivi la prima recensione
                </Button>
              </Link>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Ricarica la pagina
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-visible">
            {latestReviews.map((review) => {
              // Verify all required data is present
              if (!review || !review.id || !review.title) {
                console.error('Invalid review data:', review);
                return null;
              }
              
              const condition = review.PATOLOGIE?.Patologia || 'Patologia non specificata';
              const preview = (review.experience || 'Nessuna esperienza descritta').slice(0, 150) + '...';
              const username = review.username || 'Anonimo';
              const likesCount = typeof review.likes_count === 'number' ? review.likes_count : 0;
              const commentsCount = typeof review.comments_count === 'number' ? review.comments_count : 0;
              
              return (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  title={review.title}
                  condition={condition}
                  date={new Date(review.created_at).toLocaleDateString()}
                  preview={preview}
                  username={username}
                  likesCount={likesCount}
                  commentsCount={commentsCount}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
