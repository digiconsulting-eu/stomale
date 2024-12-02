import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ReviewCard } from "@/components/ReviewCard";
import { ConditionOverview } from "@/components/condition/ConditionOverview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { capitalizeFirstLetter } from "@/utils/textUtils";

const ConditionDetail = () => {
  const { condition } = useParams();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const decodedCondition = condition ? decodeURIComponent(condition).toUpperCase() : '';

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', decodedCondition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('RECENSIONI')
        .select('*')
        .eq('condition (patologia)', decodedCondition)
        .order('"date (data)"', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (!condition) {
    return <div>Patologia non trovata</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">
        {capitalizeFirstLetter(decodedCondition)}
      </h1>
      
      <div className="mb-8">
        <ConditionOverview condition={decodedCondition} isAdmin={isAdmin} />
      </div>

      <h2 className="text-xl md:text-2xl font-semibold mb-4">Recensioni</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {isLoadingReviews ? (
          <p>Caricamento recensioni...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              title={review["title (titolo)"]}
              condition={review["condition (patologia)"]}
              experience={review["experience (esperienza)"]}
              date={review["date (data)"]}
              username={review["username (nome utente)"]}
            />
          ))
        ) : (
          <p className="text-text-light">
            Non ci sono ancora recensioni per questa patologia.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConditionDetail;