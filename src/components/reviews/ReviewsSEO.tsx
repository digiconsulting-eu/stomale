import { Helmet } from "react-helmet";

export const ReviewsSEO = () => {
  const title = "Tutte le Recensioni | Esperienze su Malattie e Patologie | StoMale.info";
  const description = "Leggi tutte le recensioni e le esperienze di pazienti con diverse malattie e patologie. Scopri sintomi, cure e storie reali su StoMale.info.";
  const canonicalUrl = "https://stomale.info/recensioni";

  return (
    <Helmet>
      <html lang="it" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="keywords" content="recensioni malattie, esperienze pazienti, testimonianze salute, sintomi, cure, trattamenti, patologie" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://stomale.info/og-image.svg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="StoMale.info" />
      <meta property="og:locale" content="it_IT" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://stomale.info/og-image.svg" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};
