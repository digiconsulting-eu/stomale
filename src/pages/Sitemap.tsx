import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        console.log('Fetching sitemap data...');
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
            // Set the content type to XML
            const xmlDoc = new DOMParser().parseFromString(data, 'text/xml');
            const xmlString = new XMLSerializer().serializeToString(xmlDoc);
            
            // Create a new document for XML content
            document.open('text/xml');
            document.write('<?xml version="1.0" encoding="UTF-8"?>\n');
            document.write(xmlString);
            document.close();
            return;
          }
          setXmlContent(data);
        }
      } catch (error) {
        console.error('Error processing sitemap:', error);
        setError('Error processing sitemap');
      }
    };

    fetchSitemapData();
  }, []);

  if (window.location.pathname.endsWith('.xml')) {
    return null;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
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