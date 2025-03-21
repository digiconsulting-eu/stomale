
import { Helmet } from "react-helmet";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getConditionMetaDescription } from "@/utils/pageTitle";

interface ConditionSEOProps {
  condition: string;
}

export const ConditionSEO = ({ condition }: ConditionSEOProps) => {
  const conditionTitle = capitalizeFirstLetter(condition);
  const formattedCondition = condition.toUpperCase();
  const pageTitle = `${formattedCondition} | Recensioni ed Esperienze | StoMale.info`;
  const metaDescription = getConditionMetaDescription(condition);
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
