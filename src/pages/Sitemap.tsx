import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        console.log('Fetching sitemap data...');
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
          
          // Create a new document with XML content
          const xmlDoc = new DOMParser().parseFromString(data, 'text/xml');
          
          // Remove any existing content
          while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
          }
          
          // Create a pre element to display formatted XML
          const pre = document.createElement('pre');
          pre.style.margin = '0';
          pre.style.padding = '20px';
          pre.style.whiteSpace = 'pre-wrap';
          pre.style.wordWrap = 'break-word';
          pre.textContent = data;
          document.body.appendChild(pre);
        }

      } catch (error) {
        console.error('Error processing sitemap:', error);
      }
    };

    fetchSitemapData();
  }, []);

  // Return null as we're manipulating the document directly
  return null;
};

export default Sitemap;