import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemapContent = async () => {
      try {
        console.log('Fetching sitemap content...');
        
        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) {
          console.error('Error fetching conditions:', conditionsError);
          throw new Error('Failed to fetch conditions');
        }

        console.log('Fetched conditions:', conditions?.length);

        // Fetch approved reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          throw new Error('Failed to fetch reviews');
        }

        console.log('Fetched reviews:', reviews?.length);

        // Generate sitemap content
        let content = '';
        content += 'https://stomale.info/\n';
        content += 'https://stomale.info/recensioni\n';
        content += 'https://stomale.info/cerca-patologia\n';
        content += 'https://stomale.info/nuova-recensione\n';
        content += 'https://stomale.info/inserisci-patologia\n';
        content += 'https://stomale.info/login\n';
        content += 'https://stomale.info/registrati\n';
        content += 'https://stomale.info/recupera-password\n\n';

        // Add condition pages
        if (conditions && conditions.length > 0) {
          conditions.forEach((condition) => {
            const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
            content += `https://stomale.info/patologia/${encodedCondition}\n`;
          });
        }

        // Add review pages
        if (reviews && reviews.length > 0) {
          reviews.forEach((review) => {
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
        }

        console.log('Generated sitemap content:', content.substring(0, 200) + '...');
        setSitemapContent(content);
      } catch (err) {
        console.error('Error generating sitemap:', err);
        setError('Error generating sitemap. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemapContent();
  }, []);

  // For the /sitemap.txt route, return plain text
  if (window.location.pathname === '/sitemap.txt') {
    if (isLoading) {
      return 'Generating sitemap...';
    }
    
    if (error) {
      return error;
    }
    
    return sitemapContent;
  }

  // For the normal route, return the styled component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-lg">Loading sitemap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <pre className="whitespace-pre-wrap break-words bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm">
          {sitemapContent || 'No sitemap content available'}
        </pre>
      </div>
    </div>
  );
};

export default Sitemap;