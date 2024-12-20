import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch conditions with their last update date
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('Patologia, created_at');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
          throw conditionsError;
        }

        console.log('Fetched conditions for sitemap:', conditions?.length);

        // Fetch approved reviews with their update dates and related condition
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            title,
            updated_at,
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
        const currentDate = format(new Date(), 'yyyy-MM-dd');
        
        // Define static routes with their priorities and update frequencies
        const staticRoutes = [
          { url: baseUrl, priority: '1.0', changefreq: 'daily' },
          { url: `${baseUrl}/recensioni`, priority: '0.9', changefreq: 'daily' },
          { url: `${baseUrl}/nuova-recensione`, priority: '0.7', changefreq: 'weekly' },
          { url: `${baseUrl}/cerca-patologia`, priority: '0.9', changefreq: 'daily' },
          { url: `${baseUrl}/cerca-sintomi`, priority: '0.8', changefreq: 'weekly' },
          { url: `${baseUrl}/inserisci-patologia`, priority: '0.6', changefreq: 'weekly' },
          { url: `${baseUrl}/privacy-policy`, priority: '0.3', changefreq: 'monthly' },
          { url: `${baseUrl}/cookie-policy`, priority: '0.3', changefreq: 'monthly' },
          { url: `${baseUrl}/terms`, priority: '0.3', changefreq: 'monthly' },
        ].map(route => ({
          ...route,
          lastmod: currentDate
        }));

        // Add condition URLs
        const conditionUrls = conditions?.map(condition => ({
          url: `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia)}`,
          lastmod: format(new Date(condition.created_at || currentDate), 'yyyy-MM-dd'),
          priority: '0.8',
          changefreq: 'weekly'
        })) || [];

        // Add review URLs
        const reviewUrls = reviews?.map(review => {
          if (review.PATOLOGIE?.Patologia && review.title) {
            const titleSlug = review.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            return {
              url: `${baseUrl}/patologia/${encodeURIComponent(review.PATOLOGIE.Patologia)}/recensione/${titleSlug}`,
              lastmod: format(new Date(review.updated_at || currentDate), 'yyyy-MM-dd'),
              priority: '0.7',
              changefreq: 'monthly'
            };
          }
          return null;
        }).filter(Boolean) || [];

        // Combine all URLs
        const allUrls = [...staticRoutes, ...conditionUrls, ...reviewUrls];

        console.log('Total URLs in sitemap:', allUrls.length);

        // Generate XML
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        // Set the XML content
        setXmlContent(xml);

        // Create and download the sitemap file
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error generating sitemap:', error);
        setXmlContent('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    };

    generateSitemap();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto" style={{ maxHeight: '600px' }}>
        {xmlContent}
      </pre>
    </div>
  );
};

export default Sitemap;