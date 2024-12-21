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

        // Create a new XML document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        
        // Set the content type header
        const xmlString = new XMLSerializer().serializeToString(xmlDoc);
        const xmlBlob = new Blob([xmlString], { type: 'application/xml' });
        const xmlUrl = URL.createObjectURL(xmlBlob);
        
        // Redirect to the XML content
        window.location.href = xmlUrl;
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;