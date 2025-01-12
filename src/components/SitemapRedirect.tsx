import { useEffect } from 'react';

export const SitemapRedirect = () => {
  useEffect(() => {
    // Construct the complete URL with the project ID
    const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`;
    console.log('Redirecting to sitemap:', sitemapUrl);
    
    // Fetch the sitemap content and display it
    fetch(sitemapUrl)
      .then(response => response.text())
      .then(text => {
        console.log('Sitemap content:', text);
        // Create a pre element to display the text content
        const pre = document.createElement('pre');
        pre.style.padding = '20px';
        pre.style.whiteSpace = 'pre-wrap';
        pre.textContent = text;
        document.body.appendChild(pre);
      })
      .catch(error => {
        console.error('Error fetching sitemap:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.padding = '20px';
        errorDiv.style.color = 'red';
        errorDiv.textContent = `Error loading sitemap: ${error.message}`;
        document.body.appendChild(errorDiv);
      });
  }, []);

  return null;
};