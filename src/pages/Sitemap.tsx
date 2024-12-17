import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState('');

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

        // Use a hardcoded base URL for production
        const baseUrl = 'https://stomale.info';
        
        // Start with static routes
        let urls = [
          `${baseUrl}/`,
          `${baseUrl}/recensioni`,
          `${baseUrl}/nuova-recensione`,
          `${baseUrl}/cerca-patologia`,
          `${baseUrl}/cerca-sintomi`,
          `${baseUrl}/inserisci-patologia`,
          `${baseUrl}/privacy-policy`,
          `${baseUrl}/cookie-policy`,
          `${baseUrl}/terms`,
        ];

        // Add condition URLs
        if (conditions) {
          const conditionUrls = conditions.map(condition => 
            `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia)}`
          );
          urls = [...urls, ...conditionUrls];
        }

        // Add review URLs
        if (reviews) {
          const reviewUrls = reviews.map(review => {
            if (review.PATOLOGIE?.Patologia && review.title) {
              const titleSlug = review.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              return `${baseUrl}/patologia/${encodeURIComponent(review.PATOLOGIE.Patologia)}/recensione/${titleSlug}`;
            }
            return null;
          }).filter(Boolean);
          urls = [...urls, ...reviewUrls];
        }

        console.log('Total URLs in sitemap:', urls.length);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

        setXmlContent(xml);
        
        // Create a Blob with the XML content
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.xml';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Error generating sitemap:', error);
        // Return a valid but empty sitemap in case of error
        setXmlContent('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    };

    generateSitemap();
  }, []);

  // Instead of trying to modify document.contentType, we'll render the XML content in a pre tag
  return (
    <pre style={{ whiteSpace: 'pre-wrap' }}>
      {xmlContent}
    </pre>
  );
};

export default Sitemap;