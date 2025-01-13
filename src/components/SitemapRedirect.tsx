import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const SitemapRedirect = () => {
  useEffect(() => {
    const fetchAndRedirectSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Create a Blob with the XML content
        const blob = new Blob([data], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        
        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('type', 'application/xml');
        
        // Trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error in sitemap fetch:', err);
      }
    };

    fetchAndRedirectSitemap();
  }, []);

  // Return null since we don't want to render anything
  return null;
};