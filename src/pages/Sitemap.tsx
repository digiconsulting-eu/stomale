import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        console.log('Fetching data for sitemap...');
        
        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('Patologia');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
          throw conditionsError;
        }

        console.log('Fetched conditions:', conditions?.length);

        // Fetch approved reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            title,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved');

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          throw reviewsError;
        }

        console.log('Fetched reviews:', reviews?.length);

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

        console.log('Total URLs in sitemap:', urls.length);

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
        setXmlContent('Error generating sitemap');
      }
    };

    generateSitemap();
  }, []);

  useEffect(() => {
    // Set content type for the response
    if (xmlContent) {
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Clean up
      return () => URL.revokeObjectURL(url);
    }
  }, [xmlContent]);

  return (
    <pre 
      style={{ 
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontFamily: 'monospace',
        padding: '20px'
      }}
      dangerouslySetInnerHTML={{ __html: xmlContent }}
    />
  );
};

export default Sitemap;