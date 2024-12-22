import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const [content, setContent] = useState<string>("Loading sitemap...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('Error fetching sitemap:', error);
          throw error;
        }

        setContent(data as string);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to generate sitemap. Please try again later.');
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
    <pre className="whitespace-pre-wrap font-mono text-sm p-4">
      {content}
    </pre>
  );
}