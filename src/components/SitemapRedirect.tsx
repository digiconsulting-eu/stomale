import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const SitemapRedirect = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Create a new XML document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        
        // Serialize the XML document
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(xmlDoc);
        
        // Create a new document to replace the current one
        document.open('text/xml');
        document.write(xmlString);
        document.close();
        
      } catch (err) {
        console.error('Error in sitemap fetch:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};