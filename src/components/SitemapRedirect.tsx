import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const SitemapRedirect = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          setError('Error loading sitemap: ' + error.message);
          return;
        }

        console.log('Sitemap content received:', data);
        setSitemapContent(data);
      } catch (err: any) {
        console.error('Error in sitemap fetch:', err);
        setError('Error loading sitemap: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-gray-600">Caricamento sitemap in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
        {sitemapContent}
      </pre>
    </div>
  );
};