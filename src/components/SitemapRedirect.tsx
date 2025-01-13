import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SitemapRedirect = () => {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) throw error;

        // Crea un nuovo documento XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        
        // Serializza il documento XML
        const serializer = new XMLSerializer();
        const xmlString = serializer.serializeToString(xmlDoc);
        
        // Scrivi il contenuto XML
        document.open('text/xml');
        document.write(xmlString);
        document.close();
        
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
  }, []);

  return null;
};