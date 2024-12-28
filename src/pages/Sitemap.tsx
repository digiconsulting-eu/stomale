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
          const xmlString = new XMLSerializer().serializeToString(xmlDoc);
          
          // Set the content type to XML
          const xmlBlob = new Blob([xmlString], { type: 'application/xml' });
          
          // Download the file directly
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(xmlBlob);
          link.download = location.pathname.substring(1); // Remove leading slash
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
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

  // Return null for XML formats as we handle the content via direct download
  return null;
}