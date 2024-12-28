import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Sitemap() {
  const location = useLocation();
  const navigate = useNavigate();
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
            // Create a new document with the XML content
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'application/xml');
            
            // Set the XML content type
            const meta = document.createElement('meta');
            meta.setAttribute('http-equiv', 'Content-Type');
            meta.setAttribute('content', 'application/xml');
            document.head.appendChild(meta);
            
            // Replace the current document content with the XML
            document.documentElement.innerHTML = new XMLSerializer().serializeToString(xmlDoc);
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