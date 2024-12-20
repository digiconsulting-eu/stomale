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

        // Set response headers
        const response = new Response(blob, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Content-Disposition': 'inline; filename=sitemap.xml'
          }
        });

        // Serve the XML content
        window.location.href = url;
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;