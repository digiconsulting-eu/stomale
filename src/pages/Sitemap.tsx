import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const [content, setContent] = useState<string>("Generating sitemap...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch conditions
        const { data: conditions, error: conditionsError } = await supabase
          .from('PATOLOGIE')
          .select('Patologia');

        if (conditionsError) throw conditionsError;

        // Fetch approved reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            title,
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved');

        if (reviewsError) throw reviewsError;

        // Generate sitemap content
        let sitemap = 'SITEMAP STOMALE.INFO\n\n';
        sitemap += 'Homepage:\nhttps://stomale.info/\n\n';
        sitemap += 'Recensioni:\nhttps://stomale.info/recensioni\n\n';

        // Add condition pages
        sitemap += 'Patologie:\n';
        conditions?.forEach((condition) => {
          const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
          sitemap += `https://stomale.info/patologia/${encodedCondition}\n`;
        });
        sitemap += '\n';

        // Add review pages
        sitemap += 'Recensioni per patologia:\n';
        reviews?.forEach((review) => {
          if (review.PATOLOGIE?.Patologia) {
            const encodedCondition = encodeURIComponent(review.PATOLOGIE.Patologia.toLowerCase());
            const reviewSlug = review.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            sitemap += `https://stomale.info/patologia/${encodedCondition}/recensione/${reviewSlug}\n`;
          }
        });
        sitemap += '\n';

        // Add other important pages
        sitemap += 'Altre pagine:\n';
        sitemap += 'https://stomale.info/cerca-patologia\n';
        sitemap += 'https://stomale.info/nuova-recensione\n';

        setContent(sitemap);
      } catch (err) {
        console.error('Error generating sitemap:', err);
        setError('Failed to generate sitemap. Please try again later.');
        setContent('Error generating sitemap');
      }
    };

    generateSitemap();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <pre className="whitespace-pre-wrap p-4 font-mono text-sm">
      {content}
    </pre>
  );
}