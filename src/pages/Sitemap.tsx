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
          .select(`
            title,
            PATOLOGIE (
              Patologia
            )
          `)
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
          const conditionUrls = conditions.map(condition => {
            if (!condition.Patologia) return null;
            const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
            return `${baseUrl}/patologia/${encodedCondition}`;
          }).filter(Boolean) as string[];
          urls = [...urls, ...conditionUrls];
        }

        // Add review URLs
        if (reviews) {
          const reviewUrls = reviews.map(review => {
            if (!review.PATOLOGIE?.Patologia || !review.title) return null;
            
            const encodedCondition = encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase());
            const encodedTitle = encodeURIComponent(
              review.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            );
            
            return `${baseUrl}/patologia/${encodedCondition}/recensione/${encodedTitle}`;
          }).filter(Boolean) as string[];
          
          urls = [...urls, ...reviewUrls];
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

        setXmlContent(xml);
        
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setXmlContent('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    };

    generateSitemap();
  }, []);

  // Set the correct content type for XML
  useEffect(() => {
    if (xmlContent) {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it to download the sitemap
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }
  }, [xmlContent]);

  return null;
};

export default Sitemap;