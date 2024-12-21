import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Create a blob with the XML content and proper MIME type
        const blob = new Blob([data], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);

        // Download the XML file
        const link = document.createElement('a');
        link.href = url;
        link.type = 'application/xml';
        link.dispatchEvent(new MouseEvent('click'));

        // Clean up
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;