import { useEffect } from 'react';

export const SitemapRedirect = () => {
  useEffect(() => {
    window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`;
  }, []);

  return null;
};