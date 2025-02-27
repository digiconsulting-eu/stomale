
import { supabase } from "@/integrations/supabase/client";

export async function generateReviewsSitemap(startId: number, endId: number) {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id, 
        title, 
        PATOLOGIE (
          id,
          Patologia
        )
      `)
      .gte('id', startId)
      .lte('id', endId)
      .eq('status', 'approved')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching reviews:', error);
      return null;
    }

    if (!reviews || reviews.length === 0) {
      console.warn('No reviews found in the specified range');
      return null;
    }

    console.log(`Found ${reviews.length} reviews`);

    // Generate XML content for sitemap
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    reviews.forEach((review) => {
      if (review.PATOLOGIE && review.PATOLOGIE.Patologia) {
        const condition = review.PATOLOGIE.Patologia.toLowerCase().replace(/\s+/g, '-');
        const slugTitle = slugify(review.title);
        const url = `https://stomale.info/patologia/${condition}/esperienza/${review.id}-${slugTitle}`;
        
        xmlContent += `  <url>
    <loc>${url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    });

    xmlContent += `</urlset>`;
    return xmlContent;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return null;
  }
}

// Helper function to create slug from title
function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .substring(0, 50); // Limit slug length
}
