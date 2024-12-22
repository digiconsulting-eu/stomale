import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const generateSitemap = async () => {
      try {
        console.log('Fetching conditions...');
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) {
          console.error('Conditions error:', conditionsError);
          throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
        }

        if (!conditions || conditions.length === 0) {
          console.log('No conditions found');
          throw new Error('No conditions data received');
        }

        console.log(`Found ${conditions.length} conditions`);

        console.log('Fetching reviews...');
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) {
          console.error('Reviews error:', reviewsError);
          throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
        }

        console.log(`Found ${reviews?.length || 0} reviews`);

        let content = 'SITEMAP STOMALE.INFO\n\n';
        content += 'Homepage:\nhttps://stomale.info/\n\n';
        content += 'Recensioni:\nhttps://stomale.info/recensioni\n\n';

        content += 'Patologie:\n';
        conditions.forEach((condition) => {
          const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
          content += `https://stomale.info/patologia/${encodedCondition}\n`;
        });
        content += '\n';

        if (reviews && reviews.length > 0) {
          content += 'Recensioni per patologia:\n';
          reviews.forEach((review) => {
            const condition = conditions.find(c => c.id === review.condition_id);
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
        }

        content += 'Altre pagine:\n';
        content += 'https://stomale.info/cerca-patologia\n';
        content += 'https://stomale.info/nuova-recensione\n';
        content += 'https://stomale.info/privacy-policy\n';
        content += 'https://stomale.info/cookie-policy\n';
        content += 'https://stomale.info/terms\n';

        console.log('Sitemap content generated');

        if (isMounted) {
          setSitemapContent(content);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Sitemap generation error:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Error generating sitemap');
          setIsLoading(false);
        }
      }
    };

    generateSitemap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center animate-pulse">Generating sitemap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (!sitemapContent) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">No sitemap content available</div>
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