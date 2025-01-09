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

        if (typeof data === 'string') {
          if (window.location.pathname.endsWith('.xml')) {
            // Create a new document with XML content type
            const xmlDoc = new Document();
            xmlDoc.appendChild(xmlDoc.createElement('xml'));
            document.documentElement.innerHTML = data;
            
            // Set XML content type
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Content-Type';
            meta.content = 'application/xml; charset=UTF-8';
            document.head.appendChild(meta);
            
            return;
          }
          setXmlContent(data);
        }
      } catch (error) {
        console.error('Error processing sitemap:', error);
        setError('Error processing sitemap');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemapData();
  }, []);

  if (window.location.pathname.endsWith('.xml')) {
    return null;
  }

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

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  const urls = xmlDoc.getElementsByTagName("url");
  const sitemapEntries = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const loc = url.getElementsByTagName("loc")[0]?.textContent;
    const lastmod = url.getElementsByTagName("lastmod")[0]?.textContent;
    const changefreq = url.getElementsByTagName("changefreq")[0]?.textContent;
    const priority = url.getElementsByTagName("priority")[0]?.textContent;

    if (loc) {
      sitemapEntries.push(
        <div key={i} className="mb-4 p-4 border rounded hover:bg-gray-50">
          <a 
            href={loc} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-lg"
          >
            {loc}
          </a>
          <div className="text-sm text-gray-600 mt-2 space-y-1">
            {lastmod && <div>Last modified: {new Date(lastmod).toLocaleDateString()}</div>}
            {changefreq && <div>Change frequency: {changefreq}</div>}
            {priority && <div>Priority: {priority}</div>}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Sitemap</h1>
      <div className="space-y-4">
        {sitemapEntries.length > 0 ? sitemapEntries : (
          <div className="text-gray-500">No entries found in sitemap</div>
        )}
      </div>
    </div>
  );
};

export default Sitemap;