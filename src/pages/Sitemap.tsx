import { useEffect, useState } from "react";

export default function Sitemap() {
  const [content, setContent] = useState<string>("Generating sitemap...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('https://hnuhdoycwpjfjhthfqbt.functions.supabase.co/sitemap', {
          method: 'GET',
          headers: {
            'Content-Type': 'text/plain',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sitemap');
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error fetching sitemap:', err);
        setError('Failed to generate sitemap. Please try again later.');
      }
    };

    fetchSitemap();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return content;
}