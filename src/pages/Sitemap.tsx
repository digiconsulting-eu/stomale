import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Sitemap = () => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        console.log('[Sitemap] Starting sitemap fetch...');
        const { data, error } = await supabase.functions.invoke('sitemap');
        
        if (error) {
          console.error('[Sitemap] Error fetching sitemap:', error);
          return;
        }

        console.log('[Sitemap] Sitemap data received:', data);
        setContent(data || '');
      } catch (err) {
        console.error('[Sitemap] Error:', err);
      }
    };

    fetchSitemap();
  }, []);

  return (
    <pre style={{ 
      margin: 0,
      padding: 0,
      fontFamily: 'monospace',
      whiteSpace: 'pre',
      display: 'block'
    }}>
      {content}
    </pre>
  );
};

export default Sitemap;