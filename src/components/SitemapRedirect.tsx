import { useEffect } from 'react';

export const SitemapRedirect = () => {
  useEffect(() => {
    // Construct the complete URL with the project ID
    const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`;
    console.log('Redirecting to sitemap:', sitemapUrl);
    window.location.href = sitemapUrl;
  }, []);

  return null;
};