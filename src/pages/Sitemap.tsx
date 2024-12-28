import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const location = useLocation();
  const isXmlFormat = ['/sitemap.xml', '/sitemap-google.xml'].includes(location.pathname);

  useEffect(() => {
    const fetchSitemap = async () => {
      if (isXmlFormat) {
        try {
          const { data } = await supabase.functions.invoke('sitemap', {
            method: 'GET',
            headers: {
              'Accept': 'application/xml'
            }
          });

          if (typeof data === 'string') {
            // Create a new window/tab with the XML content
            const xmlWindow = window.open('', '_self');
            if (xmlWindow) {
              xmlWindow.document.write(data);
              xmlWindow.document.contentType = 'application/xml';
              xmlWindow.document.close();
            }
          }
        } catch (error) {
          console.error('Error fetching sitemap:', error);
        }
      }
    };

    fetchSitemap();
  }, [location.pathname, isXmlFormat]);

  // For non-XML formats (like /sitemap), render a simple message
  if (!isXmlFormat) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
        <p>Please visit /sitemap.xml or /sitemap-google.xml for the XML version.</p>
      </div>
    );
  }

  // Return null for XML formats as we handle the content directly
  return null;
}