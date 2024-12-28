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

          // For XML formats, serve the content directly
          if (typeof data === 'string') {
            // Clear the current document
            document.open('text/xml');
            document.write(data);
            document.close();
          }
        } catch (error) {
          console.error('Error fetching sitemap:', error);
        }
      }
    };

    fetchSitemap();
  }, [location.pathname, isXmlFormat]);

  // For XML formats, return null as we handle the content directly
  if (isXmlFormat) {
    return null;
  }

  // For non-XML formats (like /sitemap), render a simple message
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <p>Please visit /sitemap.xml or /sitemap-google.xml for the XML version.</p>
    </div>
  );
}