import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        console.log('Fetching sitemap data...');
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        if (typeof data === 'string') {
          // Create a blob with the XML data
          const blob = new Blob([data], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);
          
          // Create a link to download/view the XML
          const a = document.createElement('a');
          a.href = url;
          a.download = 'sitemap.xml'; // This will be ignored when viewing in browser
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } catch (error) {
        console.error('Error processing sitemap:', error);
      }
    };

    fetchSitemapData();
  }, []);

  // Return null as we're handling the XML display directly
  return null;
};

export default Sitemap;