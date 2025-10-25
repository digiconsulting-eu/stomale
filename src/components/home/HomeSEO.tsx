
import { Helmet } from "react-helmet";

interface HomeSEOProps {
  structuredData: any;
  organizationSchema: any;
  reviewsAggregateSchema: any | null;
}

export const HomeSEO = ({ structuredData, organizationSchema, reviewsAggregateSchema }: HomeSEOProps) => {
  return (
    <Helmet>
      <html lang="it" />
      <title>StoMale.info | Recensioni su malattie, sintomi e patologie</title>
      <meta name="description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
      <meta name="keywords" content="malattie, patologie, recensioni mediche, esperienze pazienti, sintomi, cure, trattamenti, stomale, salute" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content="StoMale.info | Recensioni su malattie, sintomi e patologie" />
      <meta property="og:description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://stomale.info/" />
      <meta property="og:image" content="https://stomale.info/og-image.svg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="StoMale.info" />
      <meta property="og:locale" content="it_IT" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="StoMale.info | Recensioni su malattie, sintomi e patologie" />
      <meta name="twitter:description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
      <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
      
      {/* Additional SEO tags */}
      <meta name="author" content="StoMale.info" />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {reviewsAggregateSchema && (
        <script type="application/ld+json">
          {JSON.stringify(reviewsAggregateSchema)}
        </script>
      )}
      <link rel="canonical" href="https://stomale.info/" />
    </Helmet>
  );
};
