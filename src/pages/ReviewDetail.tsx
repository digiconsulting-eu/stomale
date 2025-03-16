
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { ReviewError } from "@/components/review/ReviewError";
import { useReviewQuery } from "@/hooks/useReviewQuery";
import { setPageTitle, setMetaDescription, getReviewMetaDescription } from "@/utils/pageTitle";

const ReviewDetail = () => {
  const { condition, slug } = useParams();
  
  // Use condition as-is, without replacing hyphens or additional processing
  const decodedCondition = condition || '';
  const reviewId = slug?.split('-')[0];

  const { data: review, isLoading, error } = useReviewQuery(reviewId, decodedCondition);

  useEffect(() => {
    if (review?.title && review?.PATOLOGIE?.Patologia) {
      // Titolo ottimizzato con patologia in evidenza e keywords
      const formattedCondition = review.PATOLOGIE.Patologia.toUpperCase();
      setPageTitle(`${formattedCondition}: Recensione ed Esperienza | ${review.title} | StoMale.info`);
      setMetaDescription(getReviewMetaDescription(review.PATOLOGIE.Patologia, review.title));
    }
  }, [review?.title, review?.PATOLOGIE?.Patologia]);

  if (error) {
    console.error('Error loading review:', error);
    return <ReviewError message="Si è verificato un errore nel caricamento della recensione." />;
  }

  if (isLoading) {
    return <ReviewLoader />;
  }

  if (!review) {
    return <ReviewError message="La recensione richiesta non è stata trovata." />;
  }

  // Schema.org markup migliorato per recensioni mediche
  const jsonLdReview = {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": Math.round((5 - review.diagnosis_difficulty + 5 - review.symptoms_severity + 
                                (review.has_medication ? review.medication_effectiveness : 3) + 
                                review.healing_possibility + (5 - review.social_discomfort)) / 5),
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": review.username || "Utente Anonimo"
    },
    "datePublished": new Date(review.created_at).toISOString(),
    "name": review.title,
    "reviewBody": review.experience,
    "itemReviewed": {
      "@type": "MedicalCondition",
      "name": review.PATOLOGIE?.Patologia,
      "description": review.symptoms
    }
  };

  // Breadcrumb schema per migliorare l'indicizzazione
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://stomale.info/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": review.PATOLOGIE?.Patologia?.toUpperCase() || 'Patologia',
        "item": `https://stomale.info/patologia/${decodedCondition.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": review.title,
        "item": window.location.href
      }
    ]
  };

  return (
    <>
      {/* Schema.org markup multiplo */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdReview) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      
      <ReviewContent
        username={review.username}
        title={review.title}
        condition={review.PATOLOGIE?.Patologia?.toLowerCase()}
        symptoms={review.symptoms}
        experience={review.experience}
        diagnosisDifficulty={review.diagnosis_difficulty}
        symptomSeverity={review.symptoms_severity}
        hasMedication={review.has_medication}
        medicationEffectiveness={review.medication_effectiveness}
        healingPossibility={review.healing_possibility}
        socialDiscomfort={review.social_discomfort}
        reviewId={review.id.toString()}
        date={new Date(review.created_at).toLocaleDateString('it-IT')}
        likesCount={review.likes_count || 0}
      />
    </>
  );
};

export default ReviewDetail;
