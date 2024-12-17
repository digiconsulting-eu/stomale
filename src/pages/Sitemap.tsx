import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('Patologia');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
          throw conditionsError;
        }

        console.log('Fetched conditions for sitemap:', conditions?.length);

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

        console.log('Fetched reviews for sitemap:', reviews?.length);

        const baseUrl = window.location.origin;
        
        // Start with static routes
        let urls = [
          baseUrl,
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
            `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`
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
              return `${baseUrl}/patologia/${encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())}/recensione/${titleSlug}`;
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

        // Set content type to XML
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // If accessed directly as XML, serve the file
        if (window.location.pathname === '/sitemap.xml') {
          window.location.href = url;
          return;
        }

        // Otherwise show the preview
        setXmlContent(xml);

      } catch (error) {
        console.error('Error generating sitemap:', error);
        setXmlContent('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    };

    generateSitemap();
  }, []);

  // If we're requesting the XML file directly, don't render the preview
  if (window.location.pathname === '/sitemap.xml') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap Preview</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto" style={{ maxHeight: '600px' }}>
        {xmlContent}
      </pre>
    </div>
  );
};

export default Sitemap;
