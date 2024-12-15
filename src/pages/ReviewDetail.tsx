import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewContent } from "@/components/review/ReviewContent";
import { CommentSection } from "@/components/CommentSection";
import { useEffect } from "react";
import { setPageTitle } from "@/utils/pageTitle";

export default function ReviewDetail() {
  const { id } = useParams();

  const { data: review } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (review) {
      setPageTitle(`${review.title} - StoMale.info`);
    }
  }, [review]);

  return (
    <div className="container mx-auto px-4 py-8">
      {review && (
        <>
          <ReviewContent review={review} />
          <CommentSection reviewId={review.id} />
        </>
      )}
    </div>
  );
}