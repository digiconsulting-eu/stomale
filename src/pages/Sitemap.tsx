import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Route {
  path: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export default function Sitemap() {
  const [conditions, setConditions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = window.location.origin;

  const staticRoutes: Route[] = [
    { path: "/", lastmod: "2024-01-01", changefreq: "daily", priority: "1.0" },
    { path: "/recensioni", lastmod: "2024-01-01", changefreq: "daily", priority: "0.9" },
    { path: "/cerca-patologia", lastmod: "2024-01-01", changefreq: "weekly", priority: "0.8" },
    { path: "/cerca-sintomi", lastmod: "2024-01-01", changefreq: "weekly", priority: "0.8" },
    { path: "/nuova-recensione", lastmod: "2024-01-01", changefreq: "monthly", priority: "0.7" },
    { path: "/login", lastmod: "2024-01-01", changefreq: "monthly", priority: "0.5" },
    { path: "/registrati", lastmod: "2024-01-01", changefreq: "monthly", priority: "0.5" },
    { path: "/privacy-policy", lastmod: "2024-01-01", changefreq: "yearly", priority: "0.3" },
    { path: "/cookie-policy", lastmod: "2024-01-01", changefreq: "yearly", priority: "0.3" },
    { path: "/terms", lastmod: "2024-01-01", changefreq: "yearly", priority: "0.3" },
  ];

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const { data, error } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia');
        
        if (error) throw error;
        setConditions(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching conditions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConditions();
  }, []);

  const generateSitemapXML = () => {
    const sitemap = [];
    sitemap.push(`<?xml version="1.0" encoding="UTF-8"?>`);
    sitemap.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);

    // Add static routes
    staticRoutes.forEach(route => {
      sitemap.push(`
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    });

    // Add dynamic condition routes
    conditions.forEach(condition => {
      sitemap.push(`
  <url>
    <loc>${BASE_URL}/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    sitemap.push(`</urlset>`);
    return sitemap.join('\n');
  };

  useEffect(() => {
    if (!isLoading && !error) {
      const xml = generateSitemapXML();
      
      // If this is a direct XML request
      if (window.location.pathname.endsWith('.xml')) {
        document.documentElement.innerHTML = xml;
        document.querySelector('html')!.setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        return;
      }
    }
  }, [isLoading, error]);

  if (isLoading) {
    return <div>Caricamento sitemap...</div>;
  }

  if (error) {
    return <div>Errore nel caricamento della sitemap: {error}</div>;
  }

  // For non-XML requests, show a human-readable version
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
      <div className="space-y-4">
        {staticRoutes.map((route, index) => (
          <div key={index}>
            <a href={route.path} className="text-blue-600 hover:underline">
              {BASE_URL}{route.path}
            </a>
          </div>
        ))}
        {conditions.map((condition, index) => (
          <div key={index}>
            <a 
              href={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
              className="text-blue-600 hover:underline"
            >
              {BASE_URL}/patologia/{condition.Patologia.toLowerCase()}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}