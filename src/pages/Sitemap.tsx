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
        console.log('Fetching sitemap data...');
        
        const { data, error } = await supabase.functions.invoke('sitemap', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log('Sitemap response:', { data, error });
        
        if (error) {
          console.error('Error fetching sitemap:', error);
          throw error;
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
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate sitemap. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, []);

  // Handle loading state
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

  // Handle error state
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

  // Return content based on format
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