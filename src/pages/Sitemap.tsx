import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://stomale.info";

const routes = [
  { path: "/", lastmod: "2024-03-19", changefreq: "daily", priority: "1.0" },
  { path: "/recensioni", lastmod: "2024-03-19", changefreq: "daily", priority: "0.9" },
  { path: "/cerca-patologia", lastmod: "2024-03-19", changefreq: "weekly", priority: "0.8" },
  { path: "/cerca-sintomi", lastmod: "2024-03-19", changefreq: "weekly", priority: "0.8" },
  { path: "/nuova-recensione", lastmod: "2024-03-19", changefreq: "monthly", priority: "0.7" },
  { path: "/inserisci-patologia", lastmod: "2024-03-19", changefreq: "monthly", priority: "0.7" },
  { path: "/login", lastmod: "2024-03-19", changefreq: "monthly", priority: "0.5" },
  { path: "/registrati", lastmod: "2024-03-19", changefreq: "monthly", priority: "0.5" },
  { path: "/cookie-policy", lastmod: "2024-03-19", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy-policy", lastmod: "2024-03-19", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", lastmod: "2024-03-19", changefreq: "yearly", priority: "0.3" },
];

const generateSitemapXML = async () => {
  try {
    // Fetch all conditions for dynamic URLs
    const { data: conditions } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia')
      .order('Patologia');

    const sitemap = [];
    sitemap.push('<?xml version="1.0" encoding="UTF-8"?>');
    sitemap.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    // Add static routes
    routes.forEach(route => {
      sitemap.push(`
  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    });

    // Add dynamic condition routes
    if (conditions) {
      conditions.forEach(condition => {
        const path = `/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`;
        sitemap.push(`
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>2024-03-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      });
    }

    sitemap.push('</urlset>');
    return sitemap.join('\n');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
};

const Sitemap = () => {
  const [xmlContent, setXmlContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        setIsLoading(true);
        const xml = await generateSitemapXML();

        // If this is a direct XML request
        if (window.location.pathname.endsWith('.xml')) {
          const blob = new Blob([xml], { type: 'application/xml' });
          const url = URL.createObjectURL(blob);
          window.location.href = url;
          return;
        }

        setXmlContent(xml);
      } catch (error) {
        console.error('Error processing sitemap:', error);
        setError('Error generating sitemap');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSitemapData();
  }, []);

  // For XML requests, we've already handled the content
  if (window.location.pathname.endsWith('.xml')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sitemap</h1>
      <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm">
        {xmlContent}
      </pre>
    </div>
  );
};

export default Sitemap;