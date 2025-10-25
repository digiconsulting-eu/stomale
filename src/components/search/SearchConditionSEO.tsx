import { Helmet } from "react-helmet";

export const SearchConditionSEO = () => {
  const title = "Cerca Patologia | Trova Informazioni su Malattie | StoMale.info";
  const description = "Cerca e trova informazioni, recensioni ed esperienze su centinaia di patologie e malattie. Database completo di esperienze di pazienti su StoMale.info.";
  const canonicalUrl = "https://stomale.info/cerca-patologia";

  return (
    <Helmet>
      <html lang="it" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="keywords" content="cerca patologia, cerca malattie, database malattie, elenco patologie, sintomi malattie, esperienze pazienti" />
      
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
