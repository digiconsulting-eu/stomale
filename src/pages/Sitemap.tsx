import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        console.log('Fetching sitemap data...');
        const { data, error } = await supabase.functions.invoke('sitemap', {
          method: 'GET'
        });

        if (error) {
          console.error('Error fetching sitemap:', error);
          return;
        }

        if (typeof data === 'string') {
          setXmlContent(data);
          
          // Parse XML and create clickable links
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const urls = xmlDoc.getElementsByTagName('url');
          
          // Remove any existing content
          while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
          }
          
          // Create container for sitemap links
          const container = document.createElement('div');
          container.style.padding = '20px';
          container.style.maxWidth = '1200px';
          container.style.margin = '0 auto';
          container.style.fontFamily = 'Inter, sans-serif';
          
          // Add title
          const title = document.createElement('h1');
          title.textContent = 'Sitemap';
          title.style.marginBottom = '20px';
          title.style.fontSize = '24px';
          title.style.fontWeight = 'bold';
          container.appendChild(title);

          // Process each URL
          Array.from(urls).forEach((url) => {
            const loc = url.getElementsByTagName('loc')[0]?.textContent;
            const lastmod = url.getElementsByTagName('lastmod')[0]?.textContent;
            const changefreq = url.getElementsByTagName('changefreq')[0]?.textContent;
            const priority = url.getElementsByTagName('priority')[0]?.textContent;
            
            if (loc) {
              // Create link container
              const linkContainer = document.createElement('div');
              linkContainer.style.marginBottom = '16px';
              linkContainer.style.padding = '12px';
              linkContainer.style.borderRadius = '8px';
              linkContainer.style.backgroundColor = '#f8f9fa';
              linkContainer.style.transition = 'all 0.2s';
              
              // Create link
              const link = document.createElement('a');
              link.href = loc;
              link.textContent = loc;
              link.style.color = '#0066cc';
              link.style.textDecoration = 'none';
              link.style.display = 'block';
              link.style.marginBottom = '4px';
              link.style.fontSize = '16px';
              
              // Add hover effect
              linkContainer.addEventListener('mouseenter', () => {
                linkContainer.style.backgroundColor = '#f0f2f5';
                link.style.textDecoration = 'underline';
              });
              
              linkContainer.addEventListener('mouseleave', () => {
                linkContainer.style.backgroundColor = '#f8f9fa';
                link.style.textDecoration = 'none';
              });
              
              // Add metadata
              const metadata = document.createElement('div');
              metadata.style.fontSize = '12px';
              metadata.style.color = '#666';
              metadata.style.marginTop = '4px';
              
              if (lastmod) {
                const lastmodSpan = document.createElement('span');
                lastmodSpan.textContent = `Last modified: ${new Date(lastmod).toLocaleDateString()}`;
                metadata.appendChild(lastmodSpan);
              }
              
              if (changefreq) {
                const changefreqSpan = document.createElement('span');
                changefreqSpan.textContent = ` • Update frequency: ${changefreq}`;
                metadata.appendChild(changefreqSpan);
              }
              
              if (priority) {
                const prioritySpan = document.createElement('span');
                prioritySpan.textContent = ` • Priority: ${priority}`;
                metadata.appendChild(prioritySpan);
              }
              
              linkContainer.appendChild(link);
              linkContainer.appendChild(metadata);
              container.appendChild(linkContainer);
            }
          });
          
          document.body.appendChild(container);
        }

      } catch (error) {
        console.error('Error processing sitemap:', error);
      }
    };

    fetchSitemapData();
  }, []);

  // Return null as we're manipulating the document directly
  return null;
};

export default Sitemap;