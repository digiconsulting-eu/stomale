import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
        if (!conditions || conditions.length === 0) throw new Error('No conditions found');

        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);

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

        setSitemapContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error generating sitemap');
      } finally {
        setIsLoading(false);
      }
    };

    generateSitemap();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium">Generating sitemap...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg font-medium">{error}</div>
      </div>
    );
  }

  return (
    <pre className="p-8 font-mono text-sm whitespace-pre-wrap break-words">
      {sitemapContent}
    </pre>
  );
};

export default Sitemap;