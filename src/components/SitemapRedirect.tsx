import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const SitemapRedirect = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        // Set the XML content type
        document.contentType = 'application/xml';
        
        // Clear any existing content
        document.documentElement.innerHTML = '';
        
        // Create and append the XML processing instruction
        const xmlPI = document.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
        document.insertBefore(xmlPI, document.documentElement);
        
        // Parse and append the sitemap XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'application/xml');
        document.documentElement.remove(); // Remove the existing HTML root
        document.appendChild(xmlDoc.documentElement);
        
      } catch (err) {
        console.error('Error in sitemap fetch:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};