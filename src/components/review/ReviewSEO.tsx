
import { Helmet } from "react-helmet";
import { Review } from "@/types/review";
import { getReviewMetaDescription } from "@/utils/pageTitle";
import { slugify } from "@/utils/slugify";

interface ReviewSEOProps {
  review: Review;
  metaDescription: string;
  canonicalUrl: string;
  pageTitle: string;
}

export const ReviewSEO = ({ review, metaDescription, canonicalUrl, pageTitle }: ReviewSEOProps) => {
  // Fixed schema.org markup for reviews - correct type for author and proper itemReviewed
  const reviewSchema = {
    "@context": "https://schema.org",
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
    "datePublished": new Date(review.created_at).toISOString(),
    "name": review.title,
    "reviewBody": review.experience,
    "itemReviewed": {
      "@type": "MedicalCondition",
      "name": review.PATOLOGIE?.Patologia
    }
  };

  // Breadcrumb schema for improving indexing
  const breadcrumbSchema = {
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
        "item": `https://stomale.info/patologia/${slugify(review.PATOLOGIE?.Patologia || '')}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": review.title,
        "item": canonicalUrl
      }
    ]
  };
  
  // Separate WebPage schema since the review shouldn't be directly on the WebPage
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": metaDescription,
    "url": canonicalUrl,
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://stomale.info/og-image.svg",
      "width": "1200",
      "height": "630"
    }
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content="https://stomale.info/og-image.svg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="StoMale.info" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Schema.org markup */}
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(reviewSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};
