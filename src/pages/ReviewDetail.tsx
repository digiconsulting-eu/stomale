import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewStats } from "@/components/ReviewStats";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, PenSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { CommentSection } from "@/components/CommentSection";

export default function ReviewDetail() {
  const { condition, title } = useParams();
  const conditionName = capitalizeFirstLetter(condition || '');

  const { data: review, isLoading } = useQuery({
    queryKey: ["review", condition, title],
    queryFn: async () => {
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
      <div className="flex justify-between items-start mb-6">
        <Link 
          to={`/patologia/${condition}`}
          className="text-primary hover:underline"
        >
          ← Leggi altre esperienze su {conditionName}
        </Link>
        <Button 
          asChild
          className="flex items-center gap-2"
        >
          <Link to={`/nuova-recensione?patologia=${condition}`}>
            <PenSquare className="mr-2 h-4 w-4" />
            Racconta la tua esperienza
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Valutazioni</h2>
            <ReviewStats
              diagnosisDifficulty={review.diagnosisDifficulty}
              symptomSeverity={review.symptomsDiscomfort}
              hasMedication={review.hasDrugTreatment === 'yes'}
              medicationEffectiveness={review.drugTreatmentEffectiveness}
              healingPossibility={review.healingPossibility}
              socialDiscomfort={review.socialDiscomfort}
            />
          </Card>
        </div>

        <div className="md:col-span-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {review.title || `Esperienza con ${conditionName}`}
          </h1>
          
          <div className="flex items-center mb-4">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Link 
                to={`/patologia/${condition}`}
                className="hover:underline"
              >
                {conditionName}
              </Link>
            </span>
            <div className="flex items-center text-text-light ml-4">
              <span className="text-sm">{new Date(review.date).toLocaleDateString('it-IT')}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p className="whitespace-pre-wrap">{review.experience}</p>
          </div>

          <CommentSection />

          <div className="mt-8 pt-8 border-t">
            <Link 
              to={`/patologia/${condition}`}
              className="text-primary hover:underline block"
            >
              ← Leggi altre esperienze su {conditionName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}