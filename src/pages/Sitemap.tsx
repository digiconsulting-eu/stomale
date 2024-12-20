import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        setSitemapXml(data);
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchSitemap();
  }, []);

  useEffect(() => {
    if (sitemapXml) {
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Programmatically download the sitemap
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    }
  }, [sitemapXml]);

  return null; // This component doesn't render anything
};

export default Sitemap;