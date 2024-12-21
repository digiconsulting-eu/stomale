import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        console.log('[Sitemap] Starting sitemap fetch...');
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('[Sitemap] Error fetching sitemap:', error);
          return;
        }

        if (!data) {
          console.error('[Sitemap] No data received from edge function');
          return;
        }

        console.log('[Sitemap] Data received:', data);

        // Create a blob with the XML content
        const blob = new Blob([data], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Download the XML file
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('[Sitemap] Error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;