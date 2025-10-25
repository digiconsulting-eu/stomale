
import { Helmet } from "react-helmet";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getConditionMetaDescription } from "@/utils/pageTitle";
import { Review } from "@/types/review";
import { slugify } from "@/utils/slugify";

interface ConditionSEOProps {
  condition: string;
  reviews?: Review[];
  reviewsCount: number;
}

export const ConditionSEO = ({ condition, reviews, reviewsCount }: ConditionSEOProps) => {
  const formattedCondition = condition.toUpperCase();
  // Dynamic page title based on whether reviews exist
  const pageTitle = `${formattedCondition} | ${reviewsCount > 0 ? `${reviewsCount} Recensioni e Storie` : 'Informazioni e Esperienze'} | StoMale.info`;
  
  let metaDescription = "";
  
  if (reviews && reviews.length > 0) {
    // Create a summary from the latest reviews to make the description unique and compelling.
    const reviewSnippets = reviews
      .map(r => r.experience || r.symptoms || '')
      .filter(text => text.length > 20)
      .slice(0, 2); // Take first two good snippets

    if (reviewSnippets.length > 0) {
      const snippetText = reviewSnippets.map(s => `"${s.substring(0, 60).trim().replace(/\s+/g, ' ')}..."`).join(' ');
      metaDescription = `Leggi ${reviewsCount} esperienze di pazienti con ${formattedCondition}. ${snippetText} Scopri sintomi, cure e storie reali su StoMale.info.`;
    }
  }
  
  // Fallback to generic description if no good content could be extracted
  if (!metaDescription) {
    metaDescription = getConditionMetaDescription(condition);
  }
  
  // Ensure the meta description is truncated to a reasonable length for SEO
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + "...";
  }
  
  const canonicalUrl = `https://stomale.info/patologia/${slugify(condition)}`;
  const ogImageUrl = "https://stomale.info/og-image.svg"; // Explicitly provide og:image URL
  
  return (
    <Helmet>
      <html lang="it" />
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="StoMale.info" />
      <meta property="og:locale" content="it_IT" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Add additional meta tags for health-related content */}
      <meta name="keywords" content={`${condition}, sintomi ${condition}, cure ${condition}, malattia, patologia, recensioni ${condition}, esperienze pazienti, testimonianze ${condition}`} />
    </Helmet>
  );
};
