
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Disclaimer } from "@/components/Disclaimer";
import { ConditionHeader } from "@/components/condition/ConditionHeader";
import { ConditionActions } from "@/components/condition/ConditionActions";
import { ConditionStats } from "@/components/condition/ConditionStats";
import { ConditionSEO } from "@/components/condition/ConditionSEO";
import { ConditionSchema } from "@/components/condition/ConditionSchema";
import { ConditionContent } from "@/components/condition/ConditionContent";
import { setPageTitle, setMetaDescription, getConditionMetaDescription } from "@/utils/pageTitle";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useConditionData } from "@/hooks/useConditionData";
import { calculateStats, calculateRating } from "@/utils/conditionUtils";

export default function ConditionDetail() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  const { condition, patologiaData, reviews, isLoading } = useConditionData();
  
  const conditionTitle = condition ? capitalizeFirstLetter(condition) : '';
  const pageTitle = `${condition?.toUpperCase()} | Recensioni ed Esperienze`;
  const metaDescription = getConditionMetaDescription(condition || '');

  useEffect(() => {
    if (condition) {
      setPageTitle(pageTitle);
      setMetaDescription(metaDescription);
    }
  }, [condition, pageTitle, metaDescription]);

  const stats = calculateStats(reviews);
  const ratingValue = calculateRating(stats);

  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewReview = () => {
    navigate(`/nuova-recensione?patologia=${condition}`);
  };

  return (
    <div className="container py-8">
      <ConditionSEO condition={condition || ''} />
      
      <ConditionSchema 
        condition={condition || ''} 
        reviews={reviews} 
        ratingValue={ratingValue} 
      />
      
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

          <ConditionContent 
            condition={condition || ''} 
            isAdmin={isAdmin}
            reviewsCount={reviews?.length || 0}
            reviews={reviews}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(condition || '')} />
      </div>
    </div>
  );
}
