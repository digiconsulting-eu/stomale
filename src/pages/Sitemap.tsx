import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemapContent = async () => {
      try {
        let content = '';
        
        // Add static routes
        content += 'https://stomale.info/\n';
        content += 'https://stomale.info/recensioni\n';
        content += 'https://stomale.info/cerca-patologia\n';
        content += 'https://stomale.info/nuova-recensione\n';
        content += 'https://stomale.info/inserisci-patologia\n';
        content += 'https://stomale.info/login\n';
        content += 'https://stomale.info/registrati\n';
        content += 'https://stomale.info/recupera-password\n\n';

        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) throw conditionsError;

        // Add condition pages
        if (conditions) {
          content += '# Patologie\n';
          conditions.forEach((condition) => {
            const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
            content += `https://stomale.info/patologia/${encodedCondition}\n`;
          });
          content += '\n';
        }

        // Fetch approved reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) throw reviewsError;

        // Add review pages
        if (reviews) {
          content += '# Recensioni\n';
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

        setSitemapContent(content);
        setIsLoading(false);
      } catch (err) {
        console.error('Error generating sitemap:', err);
        setError('Error generating sitemap');
        setIsLoading(false);
      }
    };

    fetchSitemapContent();
  }, []);

  // For the /sitemap.txt route, return plain text
  if (window.location.pathname === '/sitemap.txt') {
    if (isLoading) {
      return 'Generating sitemap...\n\nPlease wait while we gather all URLs.';
    }
    
    if (error) {
      return `Error: ${error}`;
    }
    
    return sitemapContent;
  }

  // For the normal route, return the styled component
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-center text-lg">Loading sitemap...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <pre className="whitespace-pre-wrap break-words bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm">
            {sitemapContent}
          </pre>
        )}
      </div>
    </div>
  );
};

export default Sitemap;