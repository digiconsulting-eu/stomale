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
          const { data, error } = await supabase.functions.invoke('sitemap');
          
          if (error) {
            console.error('Error fetching sitemap:', error);
            return;
          }

          if (data) {
            // Clear any existing content
            document.documentElement.innerHTML = '';
            // Set XML content type
            document.contentType = 'application/xml';
            // Write the XML content directly to the document
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

  // For non-XML formats (like /sitemap), render a simple message
  if (!isXmlFormat) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
        <p>Please visit /sitemap.xml or /sitemap-google.xml for the XML version.</p>
      </div>
    );
  }

  // Return null while loading XML content
  return null;
}