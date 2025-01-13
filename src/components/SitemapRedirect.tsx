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

        // Create a new document with XML content type
        document.open('text/xml');
        // Write the XML content directly
        document.write(data);
        document.close();
        
      } catch (err) {
        console.error('Error in sitemap fetch:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};