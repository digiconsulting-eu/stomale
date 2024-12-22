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

        if (!data) {
          console.error('[Sitemap] No data received from edge function');
          return;
        }

        console.log('[Sitemap] Data received:', data);
        setContent(data);
      } catch (err) {
        console.error('[Sitemap] Error:', err);
      }
    };

    fetchSitemap();
  }, []);

  // Use a pre tag to maintain formatting and set styles for plain text display
  return (
    <pre style={{ 
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      margin: 0,
      padding: 0,
      fontFamily: 'monospace'
    }}>
      {content}
    </pre>
  );
};

export default Sitemap;