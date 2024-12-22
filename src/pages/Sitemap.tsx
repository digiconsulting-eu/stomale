import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const [content, setContent] = useState<string>("Loading sitemap...");
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const isTxtFormat = location.pathname === '/sitemap.txt';

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        console.log('Fetching sitemap data...');
        
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('Error fetching sitemap:', error);
          throw error;
        }

        if (typeof data === 'string') {
          setContent(data);
        } else {
          console.error('Unexpected response format:', data);
          throw new Error('Unexpected response format from sitemap function');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to generate sitemap. Please try again later.');
      }
    };

    fetchSitemap();
  }, []);

  // Se siamo in formato TXT, restituisci direttamente il contenuto
  if (isTxtFormat) {
    if (error) {
      return error;
    }
    return content;
  }

  // Altrimenti, mostra la versione HTML
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}