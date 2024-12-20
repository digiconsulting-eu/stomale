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

        // Create a new document with the XML content
        const xmlDoc = new DOMParser().parseFromString(data, 'application/xml');
        const xmlString = new XMLSerializer().serializeToString(xmlDoc);
        
        // Set the content type to XML
        const htmlDoc = document.implementation.createHTMLDocument();
        htmlDoc.documentElement.innerHTML = '';
        
        // Create a pre element to display the XML
        const pre = document.createElement('pre');
        pre.textContent = xmlString;
        document.body.innerHTML = '';
        document.body.appendChild(pre);
        
        // Set the correct content type
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Type';
        meta.content = 'application/xml; charset=utf-8';
        document.head.appendChild(meta);
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;