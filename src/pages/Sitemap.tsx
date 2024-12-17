import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        setIsLoading(true);
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
            condition_id,
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
        const lastmod = format(new Date(), 'yyyy-MM-dd');
        
        // Start with static routes
        const staticRoutes = [
          { url: baseUrl, priority: '1.0' },
          { url: `${baseUrl}/recensioni`, priority: '0.9' },
          { url: `${baseUrl}/nuova-recensione`, priority: '0.8' },
          { url: `${baseUrl}/cerca-patologia`, priority: '0.8' },
          { url: `${baseUrl}/cerca-sintomi`, priority: '0.8' },
          { url: `${baseUrl}/privacy-policy`, priority: '0.5' },
          { url: `${baseUrl}/cookie-policy`, priority: '0.5' },
          { url: `${baseUrl}/terms`, priority: '0.5' },
        ];

        // Add condition URLs
        const conditionUrls = conditions?.map(condition => ({
          url: `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`,
          priority: '0.8'
        })) || [];

        // Add review URLs
        const reviewUrls = reviews?.map(review => {
          if (review.PATOLOGIE?.Patologia && review.title) {
            const titleSlug = review.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            return {
              url: `${baseUrl}/patologia/${encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase())}/recensione/${titleSlug}`,
              priority: '0.7'
            };
          }
          return null;
        }).filter(Boolean) || [];

        const allUrls = [...staticRoutes, ...conditionUrls, ...reviewUrls];

        console.log('Total URLs in sitemap:', allUrls.length);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        setXmlContent(xml);
        
        // Create and download the sitemap file
        const blob = new Blob([xml], { type: 'application/xml' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);

      } catch (err) {
        console.error('Error generating sitemap:', err);
        setError('Error generating sitemap. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    generateSitemap();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Generating Sitemap...</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <div className="mb-4">
        <p className="text-gray-600">
          Your sitemap has been generated and downloaded. You can now submit it to Google Search Console.
        </p>
      </div>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px] text-sm">
        {xmlContent}
      </pre>
    </div>
  );
};

export default Sitemap;