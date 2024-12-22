import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const [content, setContent] = useState<string>("Generating sitemap...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        console.log('[Sitemap] Starting sitemap fetch...');
        const { data: functionData, error: functionError } = await supabase.functions.invoke('sitemap');
        
        if (functionError) {
          console.error('[Sitemap] Function error:', functionError);
          throw functionError;
        }

        if (typeof functionData === 'string') {
          console.log('[Sitemap] Successfully received sitemap data');
          setContent(functionData);
        } else {
          console.error('[Sitemap] Invalid data format:', functionData);
          throw new Error('Invalid sitemap format received');
        }
      } catch (err) {
        console.error('[Sitemap] Error:', err);
        setError('Failed to generate sitemap. Please try again later.');
        setContent('Error generating sitemap');
      }
    };

    fetchSitemap();
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