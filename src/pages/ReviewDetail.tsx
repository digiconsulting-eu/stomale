import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ReviewStats } from "@/components/ReviewStats";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { CommentSection } from "@/components/CommentSection";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function ReviewDetail() {
  const { condition, title } = useParams();
  const conditionName = capitalizeFirstLetter(condition || '');

  const { data: review, isLoading } = useQuery({
    queryKey: ["review", condition, title],
    queryFn: async () => {
      // Prima otteniamo l'ID della patologia
      const { data: patologiaData } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .eq('Patologia', condition?.toUpperCase())
        .single();

      if (!patologiaData) throw new Error('Patologia non trovata');

      // Poi otteniamo la recensione
      const { data: reviewData } = await supabase
        .from('RECENSIONI')
        .select('*')
        .eq('Patologia', patologiaData.id)
        .eq('Titolo', decodeURIComponent(title || ''))
        .single();

      if (!reviewData) throw new Error('Recensione non trovata');
      return reviewData;
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
          ← Torna a {conditionName}
        </Link>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Valutazioni</h2>
            <ReviewStats
              diagnosisDifficulty={Number(review["Difficoltà diagnosi"])}
              symptomSeverity={Number(review["Fastidio sintomi"])}
              hasMedication={review["Cura Farmacologica"]}
              medicationEffectiveness={Number(review["Efficacia farmaci"])}
              healingPossibility={Number(review["Possibilità guarigione"])}
              socialDiscomfort={Number(review["Disagio sociale"])}
            />
          </Card>
        </div>

        <div className="md:col-span-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {review.Titolo || `Esperienza con ${conditionName}`}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <Badge variant="secondary" className="px-4 py-1.5">
              <Link 
                to={`/patologia/${condition}`}
                className="hover:underline"
              >
                {conditionName}
              </Link>
            </Badge>
            <div className="flex items-center text-text-light">
              <Calendar size={14} className="mr-1" />
              <span className="text-sm">{review.Data}</span>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-4">Sintomi</h2>
            <p className="whitespace-pre-wrap mb-6">{review.Sintomi}</p>

            <h2 className="text-xl font-semibold mb-4">Esperienza</h2>
            <p className="whitespace-pre-wrap mb-8">{review.Esperienza}</p>
          </div>

          <CommentSection />

          <div className="mt-8 pt-8 border-t">
            <Link 
              to={`/patologia/${condition}`}
              className="text-primary hover:underline block"
            >
              ← Torna a {conditionName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}