import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function Sitemap() {
  const [isXmlView, setIsXmlView] = useState(false);

  const { data: conditions = [] } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('id, Patologia')
        .order('Patologia');
      
      if (error) throw error;
      return data || [];
    }
  });

  const staticRoutes = [
    { url: '/', priority: '1.0' },
    { url: '/recensioni', priority: '0.9' },
    { url: '/cerca-patologia', priority: '0.8' },
    { url: '/cerca-sintomi', priority: '0.8' },
    { url: '/login', priority: '0.5' },
    { url: '/registrati', priority: '0.5' },
    { url: '/cookie-policy', priority: '0.3' },
    { url: '/privacy-policy', priority: '0.3' },
    { url: '/terms', priority: '0.3' }
  ];

  const generateXmlSitemap = () => {
    const baseUrl = 'https://stomale.info';
    const today = new Date().toISOString().split('T')[0];

    const urlset = [
      ...staticRoutes.map(route => `
        <url>
          <loc>${baseUrl}${route.url}</loc>
          <lastmod>${today}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>${route.priority}</priority>
        </url>
      `),
      ...conditions.map(condition => `
        <url>
          <loc>${baseUrl}/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}</loc>
          <lastmod>${today}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `)
    ].join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
  };

  useEffect(() => {
    const path = window.location.pathname;
    setIsXmlView(path.endsWith('.xml'));
  }, []);

  if (isXmlView) {
    // For XML view, return a pre-formatted XML content
    return (
      <pre style={{ display: 'none' }}>
        {generateXmlSitemap()}
      </pre>
    );
  }

  // For HTML view (regular sitemap page)
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sitemap</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Pagine principali</h2>
          <ul className="space-y-2">
            {staticRoutes.map((route) => (
              <li key={route.url}>
                <Link 
                  to={route.url}
                  className="text-primary hover:underline"
                >
                  {route.url}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Patologie</h2>
          <ul className="space-y-2">
            {conditions.map((condition) => (
              <li key={condition.id}>
                <Link 
                  to={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
                  className="text-primary hover:underline"
                >
                  {condition.Patologia}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}