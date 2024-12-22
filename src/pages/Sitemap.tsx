import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('Loading sitemap...');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');

        if (conditionsError) throw conditionsError;

        // Fetch approved reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, title, condition_id')
          .eq('status', 'approved');

        if (reviewsError) throw reviewsError;

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

        setSitemapContent(content);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setSitemapContent('Error generating sitemap');
      }
    };

    generateSitemap();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <pre style={{
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        fontFamily: 'monospace',
        padding: '20px',
        background: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '4px'
      }}>
        {sitemapContent}
      </pre>
    </div>
  );
};

export default Sitemap;