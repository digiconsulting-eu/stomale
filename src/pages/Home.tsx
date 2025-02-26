
import { ReviewsContent } from "@/components/reviews/ReviewsContent";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', currentPage],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          diagnosis_difficulty,
          symptoms_severity,
          has_medication,
          medication_effectiveness,
          healing_possibility,
          social_discomfort,
          username,
          created_at,
          PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .range(0, 5);

      if (error) throw error;
      return { reviews, totalPages: 1 };
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Benvenuto su StoMale.info
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili.
        </p>
        
        <ReviewsContent 
          reviews={data?.reviews || []}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={data?.totalPages || 1}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Home;
