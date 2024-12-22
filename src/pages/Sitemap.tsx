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

        // Create XML content
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${data.split('\n').filter(url => url.startsWith('http')).map(url => `
  <url>
    <loc>${url.trim()}</loc>
    <changefreq>weekly</changefreq>
  </url>`).join('')}
</urlset>`;

        // Set the content type to XML
        const xmlDoc = new DOMParser().parseFromString(xmlContent, 'application/xml');
        const serializer = new XMLSerializer();
        const finalXml = serializer.serializeToString(xmlDoc);

        // Create a blob with the XML content
        const blob = new Blob([finalXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);

        // Redirect to the blob URL
        window.location.href = url;
      } catch (err) {
        console.error('[Sitemap] Error:', err);
      }
    };

    fetchAndServeSitemap();
  }, []);

  return null;
};

export default Sitemap;