import { Helmet } from "react-helmet";

interface SearchSymptomsSEOProps {
  searchTerm?: string;
  resultsCount?: number;
}

export const SearchSymptomsSEO = ({ searchTerm, resultsCount }: SearchSymptomsSEOProps) => {
  const baseTitle = "Cerca Sintomi | Trova Esperienze per Sintomo | StoMale.info";
  const title = searchTerm 
    ? `Sintomi: ${searchTerm} | ${resultsCount || 0} Esperienze | StoMale.info`
    : baseTitle;
  
  const baseDescription = "Cerca recensioni ed esperienze in base ai sintomi. Trova testimonianze di persone che hanno avuto sintomi simili ai tuoi su StoMale.info.";
  const description = searchTerm
    ? `Leggi ${resultsCount || 0} esperienze di pazienti con sintomi di ${searchTerm}. Scopri cure, diagnosi e storie reali su StoMale.info.`
    : baseDescription;
  
  const canonicalUrl = "https://stomale.info/cerca-sintomi";

  return (
    <Helmet>
      <html lang="it" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="keywords" content="cerca sintomi, sintomi malattie, diagnosi sintomi, esperienze sintomi, testimonianze pazienti" />
      
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
