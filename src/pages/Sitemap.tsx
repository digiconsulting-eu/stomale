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
  const isXmlFormat = location.pathname === '/sitemap.xml';

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching sitemap from storage...');

        const fileName = isXmlFormat ? 'sitemap.xml' : 'sitemap.txt';
        const { data, error: downloadError } = await supabase.storage
          .from('sitemaps')
          .download(fileName);

        if (downloadError) {
          console.error('Error downloading sitemap:', downloadError);
          throw new Error(downloadError.message);
        }

        const content = await data.text();
        setContent(content);
      } catch (err) {
        console.error('Error in sitemap component:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch sitemap. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemap();
  }, [location.pathname, isXmlFormat]);

  // Se è richiesto il formato TXT o XML, restituisci direttamente il contenuto
  if (isTxtFormat || isXmlFormat) {
    if (isLoading) return "Fetching sitemap...";
    if (error) return error;
    return content;
  }

  // Redirect to XML format if accessed directly
  if (location.pathname === '/sitemap') {
    window.location.href = '/sitemap.xml';
    return null;
  }

  // Altrimenti, mostra l'interfaccia HTML
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
        <>
          <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <pre className="whitespace-pre-wrap break-words font-mono text-sm">
              {content}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}