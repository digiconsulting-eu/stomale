import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function Sitemap() {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isXmlFormat = location.pathname.endsWith('.xml');

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase.functions.invoke('sitemap', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': isXmlFormat ? 'application/xml' : 'text/plain'
          }
        });
        
        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (typeof data === 'string') {
          setContent(data);
          
          // For XML format, set the content type using meta tag
          if (isXmlFormat && typeof document !== 'undefined') {
            const meta = document.querySelector('meta[http-equiv="Content-Type"]');
            if (!meta) {
              const newMeta = document.createElement('meta');
              newMeta.setAttribute('http-equiv', 'Content-Type');
              newMeta.setAttribute('content', 'application/xml; charset=UTF-8');
              document.head.appendChild(newMeta);
            }
          }
        } else {
          throw new Error('Unexpected response format from sitemap function');
        }
      } catch (err) {
        console.error('Error in sitemap component:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate sitemap');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, [location.pathname, isXmlFormat]);

  // For XML format, return raw XML content
  if (isXmlFormat) {
    if (error) {
      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>Error: ${error}</loc></url></urlset>`;
    }
    return content;
  }

  // For HTML format (when accessed directly via /sitemap)
  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
          <pre className="whitespace-pre-wrap break-words font-mono text-sm">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}