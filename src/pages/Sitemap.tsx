import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('Loading sitemap...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching conditions...');
        
        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
          throw conditionsError;
        }

        console.log('Fetched conditions:', conditions?.length);
        console.log('Fetching reviews...');

        // Fetch approved reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          throw reviewsError;
        }

        console.log('Fetched reviews:', reviews?.length);

        // Generate sitemap content
        let content = 'SITEMAP STOMALE.INFO\n\n';
        content += 'Homepage:\nhttps://stomale.info/\n\n';
        content += 'Recensioni:\nhttps://stomale.info/recensioni\n\n';

        // Add condition pages
        content += 'Patologie:\n';
        conditions?.forEach((condition) => {
          const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
          content += `https://stomale.info/patologia/${encodedCondition}\n`;
        });
        content += '\n';

        // Add review pages
        content += 'Recensioni per patologia:\n';
        reviews?.forEach((review) => {
          const condition = conditions?.find(c => c.id === review.condition_id);
          if (condition) {
            const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
            const reviewSlug = review.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            content += `https://stomale.info/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
          }
        });
        content += '\n';

        // Add static pages
        content += 'Altre pagine:\n';
        content += 'https://stomale.info/cerca-patologia\n';
        content += 'https://stomale.info/nuova-recensione\n';
        content += 'https://stomale.info/privacy-policy\n';
        content += 'https://stomale.info/cookie-policy\n';
        content += 'https://stomale.info/terms\n';

        console.log('Generated sitemap content');
        setSitemapContent(content);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setError('Error generating sitemap');
        setSitemapContent('');
      } finally {
        setIsLoading(false);
      }
    };

    generateSitemap();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading sitemap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <pre className="whitespace-pre-wrap break-words font-mono p-5 bg-gray-50 border border-gray-200 rounded-md">
        {sitemapContent}
      </pre>
    </div>
  );
};

export default Sitemap;