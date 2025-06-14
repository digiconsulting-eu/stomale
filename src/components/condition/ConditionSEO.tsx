import { Helmet } from "react-helmet";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { getConditionMetaDescription } from "@/utils/pageTitle";
import { Review } from "@/types/review";
import { slugify } from "@/utils/slugify";

interface ConditionSEOProps {
  condition: string;
  reviews?: Review[];  // Optional reviews array to extract actual content for meta description
}

export const ConditionSEO = ({ condition, reviews }: ConditionSEOProps) => {
  const conditionTitle = capitalizeFirstLetter(condition);
  const formattedCondition = condition.toUpperCase();
  const pageTitle = `${formattedCondition} | Recensioni ed Esperienze | StoMale.info`;
  
  // Generate a more specific meta description if reviews are available
  let metaDescription = "";
  
  if (reviews && reviews.length > 0) {
    console.log(`Generating meta description for condition: ${condition} with ${reviews.length} reviews`);
    
    // Try to create a meta description from the reviews' content
    // Check multiple reviews to find good content
    for (let i = 0; i < Math.min(5, reviews.length); i++) {
      const review = reviews[i];
      
      // Use symptoms from the review as they're often more descriptive
      if (review.symptoms && review.symptoms.length > 50) {
        console.log(`Using symptoms from review #${i+1}: ${review.symptoms.substring(0, 30)}...`);
        metaDescription = `${formattedCondition}: ${review.symptoms.substring(0, 150).trim()}... Leggi esperienze e recensioni su StoMale.info.`;
        break;
      } 
      // Fall back to experience if symptoms aren't available or too short
      else if (review.experience && review.experience.length > 60) {
        console.log(`Using experience from review #${i+1}: ${review.experience.substring(0, 30)}...`);
        metaDescription = `${formattedCondition}: ${review.experience.substring(0, 150).trim()}... Leggi esperienze e recensioni su StoMale.info.`;
        break;
      }
    }
    
    // If we still don't have a description and there are more reviews, try to combine a couple
    if (!metaDescription && reviews.length >= 2) {
      console.log('Attempting to combine content from multiple reviews');
      
      const experienceTexts = reviews.slice(0, 3)
        .filter(r => r.experience && r.experience.length > 30)
        .map(r => r.experience.trim());
      
      if (experienceTexts.length > 0) {
        metaDescription = `${formattedCondition}: ${experienceTexts[0].substring(0, 120).trim()}... Leggi esperienze e recensioni su StoMale.info.`;
        console.log(`Created combined meta description: ${metaDescription.substring(0, 50)}...`);
      }
    }
  }
  
  // Fallback to generic description if no content could be extracted
  if (!metaDescription) {
    metaDescription = getConditionMetaDescription(condition);
    console.log(`Using fallback generic description: ${metaDescription.substring(0, 50)}...`);
  }
  
  // Ensure the meta description is truncated to a reasonable length for SEO
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + "...";
  }
  
  const canonicalUrl = `https://stomale.info/patologia/${slugify(condition)}`;
  const ogImageUrl = "https://stomale.info/og-image.svg"; // Explicitly provide og:image URL
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
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
      
      {/* Add additional meta tags for health-related content */}
      <meta name="keywords" content={`${condition}, sintomi ${condition}, cure ${condition}, malattia, patologia, recensioni ${condition}, esperienze pazienti, testimonianze ${condition}`} />
    </Helmet>
  );
};
