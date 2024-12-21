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

        // Create a new document
        const xmlDoc = new DOMParser().parseFromString(data, 'application/xml');
        const xmlString = new XMLSerializer().serializeToString(xmlDoc);

        // Set the content type to XML
        document.contentType = 'application/xml';

        // Clear the current document and write the XML
        document.documentElement.innerHTML = '';
        document.write(xmlString);
        document.close();
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;