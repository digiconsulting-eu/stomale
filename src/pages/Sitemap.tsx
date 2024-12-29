import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Sitemap() {
  const location = useLocation();
  const isXmlFormat = ['/sitemap.xml', '/sitemap-google.xml'].includes(location.pathname);

  useEffect(() => {
    const fetchSitemap = async () => {
      if (isXmlFormat) {
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`, {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Accept': 'application/xml',
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch sitemap');
          }

          const xmlText = await response.text();
          
          // Create a new document with proper XML declaration
          const xmlDoc = document.implementation.createDocument(null, 'root', null);
          const xmlDeclaration = document.implementation.createDocument(null, null, null)
            .createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
          
          // Clear existing document content
          while (document.documentElement.firstChild) {
            document.documentElement.firstChild.remove();
          }
          
          // Set XML content type
          const meta = document.createElement('meta');
          meta.setAttribute('http-equiv', 'Content-Type');
          meta.setAttribute('content', 'application/xml; charset=UTF-8');
          document.head.appendChild(meta);
          
          // Write XML content
          document.documentElement.innerHTML = xmlText;
          
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