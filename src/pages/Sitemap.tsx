import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        console.log('Fetching sitemap data...');
        setIsLoading(true);
        
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          setError('Error loading sitemap');
          return;
        }

        if (window.location.pathname.endsWith('.xml')) {
          // For XML requests, set content type and return raw XML
          document.body.innerHTML = '';  // Clear any existing HTML
          const pre = document.createElement('pre');
          pre.textContent = data;
          document.body.appendChild(pre);
          
          // Set proper XML content type
          const meta = document.createElement('meta');
          meta.httpEquiv = 'Content-Type';
          meta.content = 'application/xml; charset=UTF-8';
          document.head.appendChild(meta);
          
          return;
        }

        setXmlContent(data);
      } catch (error) {
        console.error('Error processing sitemap:', error);
        setError('Error processing sitemap');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemapData();
  }, []);

  // For XML requests, return null as we've already handled the content
  if (window.location.pathname.endsWith('.xml')) {
    return null;
  }

  // For normal web requests, show a human-readable version
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // For the HTML view, show a simple text representation
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sitemap</h1>
      <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
        {xmlContent}
      </pre>
    </div>
  );
};

export default Sitemap;