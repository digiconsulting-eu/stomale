
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
import { supabase } from "@/integrations/supabase/client";

export default function ConditionDetail() {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { condition } = useParams();
  
  console.log("ConditionDetail rendering with condition param:", condition);
  
  const { 
    patologiaData, 
    reviews, 
    isLoading,
    retryFetch 
  } = useConditionData();

  const conditionTitle = condition ? capitalizeFirstLetter(condition) : '';
  const pageTitle = condition ? `${condition.toUpperCase()} | Recensioni ed Esperienze | StoMale.info` : '';
  const metaDescription = getConditionMetaDescription(condition || '');

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          const { data: adminData } = await supabase
            .from('admin')
            .select('email')
            .eq('email', session.user.email);
          
          setIsAdmin(Array.isArray(adminData) && adminData.length > 0);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

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

  const handleRetryLoad = () => {
    // Set force refresh to trigger a new render
    setForceRefresh(prev => prev + 1);
    // Call the retry function from useConditionData
    retryFetch();
  };

  if (!condition) {
    return <div className="container py-8">Caricamento in corso...</div>;
  }

  return (
    <div className="container py-8">
      <ConditionSEO condition={condition} reviews={reviews} />
      
      <ConditionSchema 
        condition={condition} 
        reviews={reviews} 
        ratingValue={ratingValue} 
      />
      
      <ConditionHeader 
        condition={condition} 
        conditionId={patologiaData?.id || 0} 
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
            onRetry={handleRetryLoad}
          />
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(condition)} />
      </div>
    </div>
  );
}
