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
          // Parse XML string to create clickable links
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "text/xml");
          const urls = xmlDoc.getElementsByTagName("url");
          
          let formattedXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
          formattedXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
          
          for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const loc = url.getElementsByTagName("loc")[0]?.textContent;
            const lastmod = url.getElementsByTagName("lastmod")[0]?.textContent;
            const changefreq = url.getElementsByTagName("changefreq")[0]?.textContent;
            const priority = url.getElementsByTagName("priority")[0]?.textContent;
            
            formattedXml += '  <url>\n';
            formattedXml += loc ? `    <loc><a href="${loc}" target="_blank">${loc}</a></loc>\n` : '';
            formattedXml += lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '';
            formattedXml += changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : '';
            formattedXml += priority ? `    <priority>${priority}</priority>\n` : '';
            formattedXml += '  </url>\n';
          }
          
          formattedXml += '</urlset>';
          setXmlContent(formattedXml);
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

  // Return raw XML content with clickable links
  return (
    <pre 
      className="font-mono text-sm whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ 
        __html: xmlContent 
      }} 
    />
  );
};

export default Sitemap;