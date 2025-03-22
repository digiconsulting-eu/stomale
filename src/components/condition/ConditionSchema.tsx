
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Review } from "@/types/review";

interface ConditionSchemaProps {
  condition: string;
  reviews: Review[];
  ratingValue: number;
}

export const ConditionSchema = ({ condition, reviews, ratingValue }: ConditionSchemaProps) => {
  // Create proper schema for condition page
  const conditionSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": capitalizeFirstLetter(condition),
    "description": `Informazioni, esperienze e recensioni su ${condition.toUpperCase()} condivise da pazienti.`,
    "mainEntity": {
      "@type": "MedicalCondition",
      "name": capitalizeFirstLetter(condition),
      "alternateName": condition.toUpperCase()
    }
  };

  // Create separate schema for aggregate rating if there are reviews
  const aggregateRatingSchema = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Esperienze con ${capitalizeFirstLetter(condition)}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": reviews.length,
      "reviewCount": reviews.length
    }
  } : null;

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(conditionSchema) }}
      />
      {reviews.length > 0 && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
        />
      )}
    </>
  );
};
