import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const [content, setContent] = useState<string>("Generating sitemap...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        console.log('[Sitemap] Starting sitemap fetch...');
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          throw error;
        }

        if (typeof data === 'string') {
          setContent(data);
        } else {
          setContent('Error: Invalid sitemap format');
        }
      } catch (err) {
        console.error('[Sitemap] Error:', err);
        setError('Failed to generate sitemap');
        setContent('Error generating sitemap');
      }
    };

    fetchSitemap();
  }, []);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <pre className="whitespace-pre-wrap p-4 font-mono text-sm">
      {content}
    </pre>
  );
}