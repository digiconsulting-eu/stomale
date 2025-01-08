import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        // Fetch sitemap data from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Set the XML content
        if (typeof data === 'string') {
          setXmlContent(data);
        }

        // Set content type to XML
        const xmlDoc = new DOMParser().parseFromString(xmlContent, 'text/xml');
        document.contentType = 'text/xml';

        // Remove any existing content
        document.body.innerHTML = '';
        
        // Create a pre element to display formatted XML
        const pre = document.createElement('pre');
        pre.textContent = xmlContent;
        document.body.appendChild(pre);

      } catch (error) {
        console.error('Error processing sitemap:', error);
      }
    };

    fetchSitemapData();
  }, [xmlContent]);

  // Return null as we're manipulating the document directly
  return null;
};

export default Sitemap;