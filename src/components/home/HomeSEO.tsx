
import { Helmet } from "react-helmet";

interface HomeSEOProps {
  structuredData: any;
  organizationSchema: any;
  reviewsAggregateSchema: any | null;
}

export const HomeSEO = ({ structuredData, organizationSchema, reviewsAggregateSchema }: HomeSEOProps) => {
  return (
    <Helmet>
      <meta name="description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
      <meta name="keywords" content="malattie, patologie, recensioni mediche, esperienze pazienti, sintomi, cure, trattamenti" />
      <meta property="og:title" content="StoMale.info | Recensioni su malattie, sintomi e patologie" />
      <meta property="og:description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://stomale.info" />
      <meta property="og:image" content="https://stomale.info/og-image.svg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="StoMale.info | Recensioni su malattie, sintomi e patologie" />
      <meta name="twitter:description" content="Condividi la tua esperienza con una malattia o patologia e aiuta altri pazienti a capire meglio i sintomi e le cure disponibili." />
      <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
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
