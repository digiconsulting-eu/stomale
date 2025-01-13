import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const SitemapRedirect = () => {
  useEffect(() => {
    const fetchAndDisplaySitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Set the XML content type
        const xmlContent = new Blob([data], { type: 'application/xml' });
        
        // Create a temporary link and trigger download
        const url = window.URL.createObjectURL(xmlContent);
        window.location.href = url;
        
        // Cleanup the URL after navigation
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (err) {
        console.error('Error in sitemap fetch:', err);
      }
    };

    fetchAndDisplaySitemap();
  }, []);

  return null;
};