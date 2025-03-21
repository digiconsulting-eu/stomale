
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ReviewContent } from "@/components/review/ReviewContent";
import { ReviewLoader } from "@/components/review/ReviewLoader";
import { ReviewError } from "@/components/review/ReviewError";
import { useReviewQuery } from "@/hooks/useReviewQuery";
import { getReviewMetaDescription } from "@/utils/pageTitle";

const ReviewDetail = () => {
  const { condition, slug } = useParams();
  
  // Use condition as-is, without replacing hyphens or additional processing
  const decodedCondition = condition || '';
  const reviewId = slug?.split('-')[0];

  // Add console log to debug params
  console.log('ReviewDetail rendering with params:', { condition, slug, reviewId, decodedCondition });

  const { data: review, isLoading, error } = useReviewQuery(reviewId, decodedCondition);

  // Add console log to track review data
  console.log('Review data loaded:', review ? 
    { 
      id: review.id, 
      title: review.title, 
      hasSymptoms: !!review.symptoms,
      symptomsLength: review.symptoms?.length,
      experienceLength: review.experience?.length 
    } : 'No review data');

  useEffect(() => {
    if (review?.title && review?.PATOLOGIE?.Patologia) {
      // Update document title for client-side rendering
      const formattedCondition = review.PATOLOGIE.Patologia.toUpperCase();
      document.title = `${formattedCondition}: Recensione ed Esperienza | ${review.title} | StoMale.info`;
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

  // Create a more specific meta description from the actual review content
  let metaDescription = "";
  
  // Try symptoms first as they're usually more descriptive
  if (review.symptoms && review.symptoms.length > 50) {
    // Use symptoms and truncate to a reasonable length
    metaDescription = `${review.PATOLOGIE.Patologia.toUpperCase()}: ${review.title}. ${review.symptoms.substring(0, 130).trim()}... Leggi l'esperienza completa su StoMale.info.`;
  } 
  // Fall back to experience if symptoms aren't available or too short
  else if (review.experience && review.experience.length > 60) {
    // Use experience and truncate to a reasonable length
    metaDescription = `${review.PATOLOGIE.Patologia.toUpperCase()}: ${review.title}. ${review.experience.substring(0, 130).trim()}... Leggi l'esperienza completa su StoMale.info.`;
  } 
  // If no good content is available, use a combined approach
  else if (review.symptoms && review.experience) {
    // Combine both for a more complete picture
    const combinedText = `${review.symptoms.substring(0, 60).trim()} - ${review.experience.substring(0, 60).trim()}`;
    metaDescription = `${review.PATOLOGIE.Patologia.toUpperCase()}: ${review.title}. ${combinedText}... Leggi l'esperienza completa su StoMale.info.`;
  } 
  // Fallback to generic description if we still don't have something useful
  else {
    metaDescription = getReviewMetaDescription(review.PATOLOGIE.Patologia, review.title);
  }

  // Ensure the meta description is truncated to a reasonable length for SEO
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + "...";
  }

  const pageTitle = `${review.PATOLOGIE.Patologia.toUpperCase()}: Recensione ed Esperienza | ${review.title} | StoMale.info`;
  const canonicalUrl = `https://stomale.info/patologia/${decodedCondition.toLowerCase()}/esperienza/${review.id}-${encodeURIComponent(review.title.toLowerCase().replace(/\s+/g, '-'))}`;
  const ogImageUrl = "https://stomale.info/og-image.svg"; // Explicitly provide og:image URL

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
        "item": canonicalUrl
      }
    ]
  };

  return (
    <>
      {/* Use Helmet for SEO control */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="StoMale.info" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      
      {/* Schema.org markup */}
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
        symptoms={review.symptoms || ''}
        experience={review.experience || ''}
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
