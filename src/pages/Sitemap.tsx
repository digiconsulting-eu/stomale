import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setPageTitle } from "@/utils/pageTitle";

interface Route {
  path: string;
  priority: number;
  changefreq: string;
}

export default function Sitemap() {
  const [conditions, setConditions] = useState<{ Patologia: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = window.location.origin;

  const staticRoutes: Route[] = [
    { path: "/", priority: 1.0, changefreq: "daily" },
    { path: "/recensioni", priority: 0.9, changefreq: "daily" },
    { path: "/nuova-recensione", priority: 0.8, changefreq: "monthly" },
    { path: "/cerca-patologia", priority: 0.8, changefreq: "weekly" },
    { path: "/inserisci-patologia", priority: 0.7, changefreq: "monthly" },
    { path: "/cerca-sintomi", priority: 0.8, changefreq: "weekly" },
    { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
    { path: "/cookie-policy", priority: 0.3, changefreq: "yearly" },
    { path: "/terms", priority: 0.3, changefreq: "yearly" },
  ];

  useEffect(() => {
    setPageTitle("Sitemap | StoMale.info");
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("PATOLOGIE")
        .select("Patologia")
        .order("Patologia");

      if (fetchError) throw fetchError;
      setConditions(data || []);
    } catch (err) {
      console.error("Error fetching conditions:", err);
      setError("Errore nel caricamento delle patologie");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSitemapXML = () => {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
${conditions.map(condition => `  <url>
    <loc>${BASE_URL}/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

    return xmlContent;
  };

  useEffect(() => {
    if (!isLoading && !error) {
      const path = window.location.pathname;
      if (path.endsWith('.xml')) {
        const xmlContent = generateSitemapXML();
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Clean up any existing content
        document.documentElement.innerHTML = '';
        
        // Create a pre element to display the XML
        const pre = document.createElement('pre');
        pre.textContent = xmlContent;
        document.body.appendChild(pre);
        
        // Set the correct content type
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Type');
        meta.setAttribute('content', 'application/xml;charset=UTF-8');
        document.head.appendChild(meta);
        
        // Clean up the blob URL
        URL.revokeObjectURL(url);
      }
    }
  }, [isLoading, error]);

  // Return null for XML requests as we handle the content directly
  if (window.location.pathname.endsWith('.xml')) {
    return null;
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Caricamento sitemap...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  // Human-readable version
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sitemap</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Pagine principali</h2>
          <ul className="list-disc pl-5 space-y-2">
            {staticRoutes.map((route) => (
              <li key={route.path}>
                <a href={route.path} className="text-primary hover:underline">
                  {route.path}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Patologie</h2>
          <ul className="list-disc pl-5 space-y-2">
            {conditions.map((condition) => (
              <li key={condition.Patologia}>
                <a
                  href={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
                  className="text-primary hover:underline"
                >
                  {condition.Patologia}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}