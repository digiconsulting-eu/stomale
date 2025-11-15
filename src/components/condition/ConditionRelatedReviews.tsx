import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { generateReviewPath } from "@/utils/urlUtils";

interface ConditionRelatedReviewsProps {
  condition: string;
  conditionId: number;
}

export const ConditionRelatedReviews = ({ condition, conditionId }: ConditionRelatedReviewsProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['condition-related-reviews', conditionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, title, created_at')
        .eq('condition_id', conditionId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!conditionId
  });

  if (isLoading) {
    return (
      <Card className="p-4 sticky top-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Altre Recensioni
        </h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 sticky top-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Altre Recensioni
      </h3>
      <div className="space-y-2">
        {reviews.map((review) => (
          <Link
            key={review.id}
            to={generateReviewPath(condition, review.id, review.title)}
            className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
          >
            <p className="text-sm font-medium line-clamp-2 text-foreground">
              {review.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(review.created_at).toLocaleDateString('it-IT')}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
};
