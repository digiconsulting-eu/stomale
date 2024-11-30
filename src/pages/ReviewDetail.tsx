import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ReviewStats } from "@/components/ReviewStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirstLetter } from "@/utils/textUtils";

export default function ReviewDetail() {
  const { condition, title } = useParams();

  const { data: review, isLoading } = useQuery({
    queryKey: ["review", condition, title],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
      return reviews.find((r: any) => 
        r.condition.toLowerCase() === condition?.toLowerCase() &&
        (r.title || '').toLowerCase().replace(/\s+/g, '-') === title
      );
    }
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="md:col-span-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/4 mb-8" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Esperienza non trovata
        </h1>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-12 gap-8">
        {/* Left column - Stats */}
        <div className="md:col-span-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Valutazioni</h2>
            <ReviewStats
              diagnosisDifficulty={review.diagnosisDifficulty}
              symptomSeverity={review.symptomSeverity}
              hasMedication={review.hasMedication}
              medicationEffectiveness={review.medicationEffectiveness}
              healingPossibility={review.healingPossibility}
              socialDiscomfort={review.socialDiscomfort}
            />
          </Card>
        </div>

        {/* Right column - Content */}
        <div className="md:col-span-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {review.title || `Esperienza con ${capitalizeFirstLetter(review.condition)}`}
          </h1>
          
          <div className="flex items-center text-sm text-muted-foreground mb-8">
            <span>{new Date(review.date).toLocaleDateString('it-IT')}</span>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <span>{capitalizeFirstLetter(review.condition)}</span>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap">{review.experience}</p>
          </div>
        </div>
      </div>
    </div>
  );
}