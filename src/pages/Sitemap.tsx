import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('[Sitemap] Error:', error);
          return;
        }

        // Create a Blob with the sitemap content
        const blob = new Blob([data], { type: 'text/plain' });
        
        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sitemap.txt';
        
        // Append link to body, click it, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('[Sitemap] Error:', err);
      }
    };

    fetchSitemap();
  }, []);

  return null;
};

export default Sitemap;