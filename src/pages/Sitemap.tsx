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
          const { data } = await supabase.functions.invoke('sitemap');
          
          // Create a new document with the XML content
          const xmlDoc = new DOMParser().parseFromString(data, 'application/xml');
          
          // Clear the current document and set the XML content
          document.documentElement.innerHTML = '';
          const xmlNode = document.importNode(xmlDoc.documentElement, true);
          document.appendChild(xmlNode);
          
          // Set the content type meta tag
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Content-Type');
          meta.setAttribute('content', 'application/xml; charset=utf-8');
          document.head.appendChild(meta);
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

  // Return null for XML formats as we handle the content via document manipulation
  return null;
}