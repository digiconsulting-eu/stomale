
import { Helmet } from "react-helmet";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getConditionMetaDescription } from "@/utils/pageTitle";

interface ConditionSEOProps {
  condition: string;
  reviews?: any[];  // Optional reviews array to extract actual content for meta description
}

export const ConditionSEO = ({ condition, reviews }: ConditionSEOProps) => {
  const conditionTitle = capitalizeFirstLetter(condition);
  const formattedCondition = condition.toUpperCase();
  const pageTitle = `${formattedCondition} | Recensioni ed Esperienze | StoMale.info`;
  
  // Generate a more specific meta description if reviews are available
  let metaDescription = "";
  
  if (reviews && reviews.length > 0) {
    // Try to create a meta description from the first review's content
    // Check multiple reviews to find good content
    for (let i = 0; i < Math.min(3, reviews.length); i++) {
      const review = reviews[i];
      
      // Use symptoms from the review as they're often more descriptive
      if (review.symptoms && review.symptoms.length > 30) {
        metaDescription = `${formattedCondition}: ${review.symptoms.substring(0, 150).trim()}... Leggi esperienze e recensioni su StoMale.info.`;
        break;
      } 
      // Fall back to experience if symptoms aren't available or too short
      else if (review.experience && review.experience.length > 40) {
        metaDescription = `${formattedCondition}: ${review.experience.substring(0, 150).trim()}... Leggi esperienze e recensioni su StoMale.info.`;
        break;
      }
    }
    
    // If we still don't have a description and there are more reviews, try to combine a couple
    if (!metaDescription && reviews.length >= 2) {
      const symptomsTexts = reviews.slice(0, 3)
        .filter(r => r.symptoms && r.symptoms.length > 20)
        .map(r => r.symptoms.trim());
      
      if (symptomsTexts.length > 0) {
        metaDescription = `${formattedCondition}: Sintomi comuni includono ${symptomsTexts[0].substring(0, 100).trim()}... Leggi esperienze e recensioni su StoMale.info.`;
      }
    }
  }
  
  // Fallback to generic description if no content could be extracted
  if (!metaDescription) {
    metaDescription = getConditionMetaDescription(condition);
  }
  
  const canonicalUrl = `https://stomale.info/patologia/${condition.toLowerCase()}`;
  
  // Create structured data for the condition
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": conditionTitle,
    "alternateName": formattedCondition,
    "url": canonicalUrl,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content="https://stomale.info/og-image.svg" />
      <meta property="og:site_name" content="StoMale.info" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
