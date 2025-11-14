
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

  // Don't use Review schema for medical conditions - Google doesn't support it
  // Use Article schema instead for patient experiences
  const articlesSchema = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": reviews.slice(0, 5).map((review, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": review.title || `Esperienza con ${condition}`,
        "author": {
          "@type": "Person",
          "name": review.username || "Utente Anonimo"
        },
        "articleBody": review.experience || "",
        "about": {
          "@type": "MedicalCondition",
          "name": capitalizeFirstLetter(condition.replace(/-/g, ' '))
        }
      }
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articlesSchema) }}
        />
      )}
    </>
  );
};
