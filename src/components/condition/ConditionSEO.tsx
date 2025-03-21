
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
    const firstReview = reviews[0];
    if (firstReview.symptoms && firstReview.symptoms.length > 10) {
      // Use symptoms from the first review as they're often more descriptive
      metaDescription = `${formattedCondition}: ${firstReview.symptoms.substring(0, 150)}... Leggi esperienze e recensioni su StoMale.info.`;
    } else if (firstReview.experience && firstReview.experience.length > 10) {
      // Fall back to experience if symptoms aren't available
      metaDescription = `${formattedCondition}: ${firstReview.experience.substring(0, 150)}... Leggi esperienze e recensioni su StoMale.info.`;
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
