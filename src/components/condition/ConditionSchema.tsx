
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Review } from "@/types/review";

interface ConditionSchemaProps {
  condition: string;
  reviews: Review[];
  ratingValue: number;
}

export const ConditionSchema = ({ condition, reviews, ratingValue }: ConditionSchemaProps) => {
  // Create proper schema for condition page as WebPage
  const conditionSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": capitalizeFirstLetter(condition.replace(/-/g, ' ')),
    "description": `Informazioni, esperienze e recensioni su ${condition.replace(/-/g, ' ').toUpperCase()} condivise da pazienti.`,
    "mainEntity": {
      "@type": "MedicalCondition",
      "name": capitalizeFirstLetter(condition.replace(/-/g, ' ')),
      "alternateName": condition.replace(/-/g, ' ').toUpperCase()
    }
  };

  // Create separate schema for aggregate rating if there are reviews
  const aggregateRatingSchema = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product", // Using Product as it's a commonly accepted type for aggregate ratings
    "name": `Esperienze con ${capitalizeFirstLetter(condition.replace(/-/g, ' '))}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": reviews.length,
      "reviewCount": reviews.length
    },
    "review": reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 3,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.username || "Utente Anonimo"
      },
      "reviewBody": review.experience || "",
      "name": review.title || `Esperienza con ${condition}`
    }))
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
