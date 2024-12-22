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
        console.log('Starting sitemap generation...');
        
        // Fetch conditions
        console.log('Fetching conditions from PATOLOGIE table...');
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
          throw new Error(`Failed to fetch conditions: ${conditionsError.message}`);
        }

        if (!conditions) {
          console.error('No conditions data received');
          throw new Error('No conditions data received');
        }

        console.log(`Successfully fetched ${conditions.length} conditions`);

        // Fetch approved reviews
        console.log('Fetching approved reviews...');
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
        }

        if (!reviews) {
          console.error('No reviews data received');
          throw new Error('No reviews data received');
        }

        console.log(`Successfully fetched ${reviews.length} approved reviews`);

        // Generate sitemap content
        console.log('Generating sitemap content...');
        let content = 'SITEMAP STOMALE.INFO\n\n';
        content += 'Homepage:\nhttps://stomale.info/\n\n';
        content += 'Recensioni:\nhttps://stomale.info/recensioni\n\n';

        // Add condition pages
        console.log('Adding condition URLs...');
        content += 'Patologie:\n';
        conditions.forEach((condition) => {
          const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
          content += `https://stomale.info/patologia/${encodedCondition}\n`;
        });
        content += '\n';

        // Add review pages
        console.log('Adding review URLs...');
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

        // Add static pages
        console.log('Adding static page URLs...');
        content += 'Altre pagine:\n';
        content += 'https://stomale.info/cerca-patologia\n';
        content += 'https://stomale.info/nuova-recensione\n';
        content += 'https://stomale.info/privacy-policy\n';
        content += 'https://stomale.info/cookie-policy\n';
        content += 'https://stomale.info/terms\n';

        console.log('Sitemap generation completed');
        setSitemapContent(content);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in sitemap generation:', error);
        setError(error instanceof Error ? error.message : 'Error generating sitemap');
        setSitemapContent('');
      } finally {
        setIsLoading(false);
      }
    };

    generateSitemap();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {isLoading ? (
        <div className="text-center">
          <div className="animate-pulse">Loading sitemap...</div>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap break-words font-mono p-5 bg-gray-50 border border-gray-200 rounded-md">
          {sitemapContent}
        </pre>
      )}
    </div>
  );
};

export default Sitemap;