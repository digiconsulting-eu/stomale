import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Disclaimer } from "@/components/Disclaimer";
import { ConditionOverview } from "@/components/condition/ConditionOverview";
import { supabase } from "@/integrations/supabase/client";
import { ConditionHeader } from "@/components/condition/ConditionHeader";
import { ConditionActions } from "@/components/condition/ConditionActions";
import { ConditionReviews } from "@/components/condition/ConditionReviews";
import { ConditionStats } from "@/components/condition/ConditionStats";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { setPageTitle, setMetaDescription, getReviewMetaDescription } from "@/utils/pageTitle";
import { DatabaseReview, Review } from "@/types/review";

interface Stats {
  diagnosisDifficulty: number;
  symptomsDiscomfort: number;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

const calculateStats = (reviews: Review[]): Stats => {
  if (!reviews.length) {
    return {
      diagnosisDifficulty: 0,
      symptomsDiscomfort: 0,
      medicationEffectiveness: 0,
      healingPossibility: 0,
      socialDiscomfort: 0
    };
  }

  const sum = reviews.reduce((acc, review) => ({
    diagnosisDifficulty: acc.diagnosisDifficulty + review.diagnosis_difficulty,
    symptomsDiscomfort: acc.symptomsDiscomfort + review.symptoms_severity,
    medicationEffectiveness: acc.medicationEffectiveness + (review.has_medication ? review.medication_effectiveness : 0),
    healingPossibility: acc.healingPossibility + review.healing_possibility,
    socialDiscomfort: acc.socialDiscomfort + review.social_discomfort
  }), {
    diagnosisDifficulty: 0,
    symptomsDiscomfort: 0,
    medicationEffectiveness: 0,
    healingPossibility: 0,
    socialDiscomfort: 0
  });

  const medicatedReviews = reviews.filter(r => r.has_medication).length;

  return {
    diagnosisDifficulty: sum.diagnosisDifficulty / reviews.length,
    symptomsDiscomfort: sum.symptomsDiscomfort / reviews.length,
    medicationEffectiveness: medicatedReviews ? sum.medicationEffectiveness / medicatedReviews : 0,
    healingPossibility: sum.healingPossibility / reviews.length,
    socialDiscomfort: sum.socialDiscomfort / reviews.length
  };
};

export default function ConditionDetail() {
  const { condition } = useParams();
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (condition) {
      setPageTitle(getConditionPageTitle(condition));
    }
  }, [condition]);

  const { data: patologiaData } = useQuery({
    queryKey: ["patologia", condition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('id, Patologia')
        .eq('Patologia', condition?.toUpperCase())
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", patologiaData?.id],
    enabled: !!patologiaData?.id,
    queryFn: async () => {
      console.log('Fetching reviews for condition:', patologiaData?.id);
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            PATOLOGIE (
              id,
              Patologia
            )
          `)
          .eq('condition_id', patologiaData.id);
        
        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }
        console.log('Fetched reviews:', data);
        return data as DatabaseReview[];
      } catch (error) {
        console.error('Error in review fetch:', error);
        throw error;
      }
    }
  });

  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewReview = () => {
    navigate(`/nuova-recensione?patologia=${condition}`);
  };

  const reviews: Review[] = reviewsData?.map(review => ({
    ...review,
    condition: condition || '',
    username: review.username || 'Anonimo'
  })) || [];

  const stats = calculateStats(reviews);

  return (
    <div className="container py-8">
      <ConditionHeader 
        condition={condition || ''} 
        conditionId={patologiaData?.id || 0}
      />

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <ConditionStats stats={stats} />
        </div>

        <div className="md:col-span-8">
          <ConditionActions
            condition={condition || ''}
            onNavigate={handleNavigate}
            onNewReview={handleNewReview}
          />

          <div id="overview" className="mt-8">
            <ConditionOverview 
              condition={condition || ''} 
              isAdmin={isAdmin}
            />
          </div>

          <div id="experiences" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Esperienze ({reviews?.length || 0})
            </h2>
            <ConditionReviews
              reviews={reviews}
              isLoading={isLoading}
              condition={condition || ''}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(condition || '')} />
      </div>
    </div>
  );
}