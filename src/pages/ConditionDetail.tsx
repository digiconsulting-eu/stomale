import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConditionData } from "@/hooks/useConditionData";
import { Disclaimer } from "@/components/Disclaimer";
import { ConditionHeader } from "@/components/condition/ConditionHeader";
import { ConditionActions } from "@/components/condition/ConditionActions";
import { ConditionStats } from "@/components/condition/ConditionStats";
import { ConditionSEO } from "@/components/condition/ConditionSEO";
import { ConditionSchema } from "@/components/condition/ConditionSchema";
import { ConditionContent } from "@/components/condition/ConditionContent";
import { setPageTitle, setMetaDescription, getConditionMetaDescription } from "@/utils/pageTitle";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { calculateStats, calculateRating } from "@/utils/conditionUtils";

export default function ConditionDetail() {
  const [forceRefresh, setForceRefresh] = useState(0);
  const navigate = useNavigate();
  const { conditionName } = useParams();
  
  const { 
    patologiaData, 
    reviews, 
    isLoading,
    retryFetch 
  } = useConditionData();

  const conditionTitle = conditionName ? capitalizeFirstLetter(conditionName) : '';
  const pageTitle = conditionName ? `${conditionName.toUpperCase()} | Recensioni ed Esperienze | StoMale.info` : '';
  const metaDescription = getConditionMetaDescription(conditionName || '');

  useEffect(() => {
    if (conditionName) {
      // Set the document title through useEffect for client-side rendering
      document.title = pageTitle;
      
      // This helps when a page is loaded directly, not just for search engines
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', metaDescription);
      }
    }
  }, [conditionName, pageTitle, metaDescription]);

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      console.log(`Found ${reviews.length} reviews for condition '${conditionName}'`);
      // Safely check for the symptoms property 
      if (reviews[0].experience) {
        console.log('First review experience:', reviews[0].experience.substring(0, 50) + '...');
      } else {
        console.log('No experience found in the first review');
      }
    } else {
      console.log(`No reviews found for condition '${conditionName}'`);
    }
  }, [reviews, conditionName]);

  const stats = calculateStats(reviews);
  const ratingValue = calculateRating(stats);

  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewReview = () => {
    navigate(`/nuova-recensione?patologia=${conditionName}`);
  };

  const handleRetryLoad = () => {
    // Set force refresh to trigger a new render
    setForceRefresh(prev => prev + 1);
    // Call the retry function from useConditionData
    retryFetch();
  };

  if (!conditionName) {
    return <div className="container py-8">Caricamento in corso...</div>;
  }

  return (
    <div className="container py-8">
      <ConditionSEO condition={conditionName} reviews={reviews} />
      
      <ConditionSchema 
        condition={conditionName} 
        reviews={reviews} 
        ratingValue={ratingValue} 
      />
      
      <ConditionHeader 
        condition={conditionName} 
        conditionId={patologiaData?.id || 0} 
      />

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <ConditionStats stats={stats} />
        </div>

        <div className="md:col-span-8">
          <ConditionActions
            condition={conditionName}
            onNavigate={handleNavigate}
            onNewReview={handleNewReview}
          />

          <ConditionContent 
            condition={conditionName} 
            isAdmin={isAdmin}
            reviewsCount={reviews?.length || 0}
            reviews={reviews}
            isLoading={isLoading}
            onRetry={handleRetryLoad}
          />
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(conditionName)} />
      </div>
    </div>
  );
}
