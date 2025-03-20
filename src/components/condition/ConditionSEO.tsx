
import { Helmet } from "react-helmet";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getConditionMetaDescription } from "@/utils/pageTitle";

interface ConditionSEOProps {
  condition: string;
}

export const ConditionSEO = ({ condition }: ConditionSEOProps) => {
  const conditionTitle = capitalizeFirstLetter(condition);
  const pageTitle = `${condition.toUpperCase()} | Recensioni ed Esperienze`;
  const metaDescription = getConditionMetaDescription(condition);
  
  // Create structured data for the condition
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    "name": conditionTitle,
    "alternateName": condition.toUpperCase(),
    "url": `https://stomale.info/patologia/${condition.toLowerCase()}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://stomale.info/patologia/${condition.toLowerCase()}`
    }
  };
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://stomale.info/patologia/${condition.toLowerCase()}`} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content="https://stomale.info/og-image.svg" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={`https://stomale.info/patologia/${condition.toLowerCase()}`} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://stomale.info/patologia/${condition.toLowerCase()}`} />
      
      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
