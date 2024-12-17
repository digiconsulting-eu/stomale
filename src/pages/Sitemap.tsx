import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch conditions
        const { data: conditions } = await supabase
          .from('PATOLOGIE')
          .select('Patologia');

        // Fetch approved reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('title, PATOLOGIE(Patologia)')
          .eq('status', 'approved');

        const baseUrl = window.location.origin;
        
        // Static routes
        const staticUrls = [
          '',
          '/recensioni',
          '/nuova-recensione',
          '/cerca-patologia',
          '/cerca-sintomi',
          '/inserisci-patologia',
          '/cookie-policy',
          '/privacy-policy',
          '/terms'
        ];

        let urls = staticUrls.map(path => `${baseUrl}${path}`);

        // Add condition URLs
        if (conditions) {
          const conditionUrls = conditions.map(condition => 
            `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia)}`
          );
          urls = [...urls, ...conditionUrls];
        }

        // Add review URLs
        if (reviews) {
          const reviewUrls = reviews.map(review => 
            `${baseUrl}/patologia/${encodeURIComponent(review.PATOLOGIE?.Patologia || '')}/recensione/${encodeURIComponent(review.title)}`
          );
          urls = [...urls, ...reviewUrls];
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

        setXmlContent(xml);
        
        // Set the content type to XML
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        
        // Force download or display
        const a = document.createElement('a');
        a.href = url;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log(`Generated sitemap with ${urls.length} URLs`);
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };

    generateSitemap();
  }, []);

  return null;
};

export default Sitemap;