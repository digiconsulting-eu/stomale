import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SitemapProps {
  isXml?: boolean;
}

const Sitemap = ({ isXml = false }: SitemapProps) => {
  const [xmlContent, setXmlContent] = useState('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const { data: conditions } = await supabase
          .from('PATOLOGIE')
          .select('Patologia, created_at');

        console.log('Fetched conditions for sitemap:', conditions?.length);

        const { data: reviews } = await supabase
          .from('reviews')
          .select(`
            title,
            updated_at,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved');

        console.log('Fetched reviews for sitemap:', reviews?.length);

        const baseUrl = 'https://stomale.info';
        const currentDate = format(new Date(), 'yyyy-MM-dd');
        
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

        const conditionUrls = conditions?.map(condition => ({
          url: `${baseUrl}/patologia/${encodeURIComponent(condition.Patologia)}`,
          lastmod: format(new Date(condition.created_at || currentDate), 'yyyy-MM-dd'),
          priority: '0.8',
          changefreq: 'weekly'
        })) || [];

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

        const allUrls = [...staticRoutes, ...conditionUrls, ...reviewUrls];

        console.log('Total URLs in sitemap:', allUrls.length);

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        setXmlContent(xml);

        if (isXml) {
          // For XML format, set the content type and return the raw XML
          const blob = new Blob([xml], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'sitemap.xml';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }

      } catch (error) {
        console.error('Error generating sitemap:', error);
        setXmlContent('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
      }
    };

    generateSitemap();
  }, [isXml]);

  if (isXml) {
    return null;
  }

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