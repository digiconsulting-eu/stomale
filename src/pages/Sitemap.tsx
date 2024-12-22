import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Sitemap() {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isTxtFormat = location.pathname === '/sitemap.txt';

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching sitemap data...', location.pathname);
        
        const { data, error: fetchError } = await supabase.functions.invoke('sitemap', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/plain'
          }
        });
        
        console.log('Sitemap response:', { data, error: fetchError });
        
        if (fetchError) {
          console.error('Error fetching sitemap:', fetchError);
          throw new Error(fetchError.message);
        }

        if (typeof data === 'string') {
          setContent(data);
        } else if (data?.error) {
          throw new Error(data.error);
        } else {
          console.error('Unexpected response format:', data);
          throw new Error('Unexpected response format from sitemap function');
        }
      } catch (err) {
        console.error('Error in sitemap component:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate sitemap. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, [location.pathname]);

  if (isLoading) {
    if (isTxtFormat) {
      return "Loading sitemap...";
    }
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    if (isTxtFormat) {
      return error;
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (isTxtFormat) {
    return content;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm">
          {content}
        </pre>
      </div>
    </div>
  );
}