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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (isTxtFormat) {
    return (
      <pre style={{ 
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        margin: 0,
        padding: '1rem',
        fontFamily: 'monospace'
      }}>
        {content}
      </pre>
    );
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