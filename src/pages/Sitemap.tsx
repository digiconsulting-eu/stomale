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
          // Set raw XML content
          setXmlContent(data);
        }
      } catch (error) {
        console.error('Error processing sitemap:', error);
        setError('Error processing sitemap');
      }
    };

    fetchSitemapData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Set the content type to XML
  if (window.location.pathname.endsWith('.xml')) {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    window.location.href = url;
    return null;
  }

  // For the HTML view, parse and display with clickable links
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
        <div key={i} className="mb-4">
          <a 
            href={loc} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {loc}
          </a>
          <div className="text-sm text-gray-600 ml-4">
            {lastmod && <div>Last modified: {lastmod}</div>}
            {changefreq && <div>Change frequency: {changefreq}</div>}
            {priority && <div>Priority: {priority}</div>}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="p-4 space-y-4">
      {sitemapEntries}
    </div>
  );
};

export default Sitemap;