import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";

export default function Index() {
  const { data: latestReviews } = useQuery({
    queryKey: ['latestReviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Reviews')
        .select(`
          *,
          PATOLOGIE (Patologia)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Ultime Recensioni</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {latestReviews?.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id.toString()}
            title={review.title}
            condition={review.PATOLOGIE.Patologia}
            preview={review.experience}
            date={new Date(review.created_at).toLocaleDateString('it-IT')}
          />
        ))}
      </div>
    </div>
  );
}
