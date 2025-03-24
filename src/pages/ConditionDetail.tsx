
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
  const pageTitle = condition ? `${condition.toUpperCase()} | Recensioni ed Esperienze | StoMale.info` : '';
  const metaDescription = getConditionMetaDescription(condition || '');

  useEffect(() => {
    if (condition) {
      // Set the document title through useEffect for client-side rendering
      document.title = pageTitle;
      
      // This helps when a page is loaded directly, not just for search engines
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', metaDescription);
      }
    }
  }, [condition, pageTitle, metaDescription]);

  // Log reviews content to help debug meta description generation
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      console.log(`Found ${reviews.length} reviews for condition '${condition}'`);
      // Safely check for the symptoms property 
      if (reviews[0].experience) {
        console.log('First review experience:', reviews[0].experience.substring(0, 50) + '...');
      } else {
        console.log('No experience found in the first review');
      }
    } else {
      console.log(`No reviews found for condition '${condition}'`);
    }
  }, [reviews, condition]);

  const stats = calculateStats(reviews);
  const ratingValue = calculateRating(stats);

  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewReview = () => {
    navigate(`/nuova-recensione?patologia=${condition}`);
  };

  if (!condition) {
    return <div className="container py-8">Caricamento in corso...</div>;
  }

  return (
    <div className="container py-8">
      {/* Pass reviews to ConditionSEO to create better meta descriptions */}
      <ConditionSEO condition={condition} reviews={reviews} />
      
      <ConditionSchema 
        condition={condition} 
        reviews={reviews} 
        ratingValue={ratingValue} 
      />
      
      <ConditionHeader 
        condition={condition} 
        conditionId={patologiaData?.id || a0} 
      />

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <ConditionStats stats={stats} />
        </div>

        <div className="md:col-span-8">
          <ConditionActions
            condition={condition}
            onNavigate={handleNavigate}
            onNewReview={handleNewReview}
          />

          <ConditionContent 
            condition={condition} 
            isAdmin={isAdmin}
            reviewsCount={reviews?.length || 0}
            reviews={reviews}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(condition)} />
      </div>
    </div>
  );
}
