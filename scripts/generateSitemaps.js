
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const generateSitemaps = async () => {
  try {
    console.log('Inizio generazione sitemap...');
    
    // Inizializza il client Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Le variabili di ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere definite');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch delle recensioni
    const { data: reviews, error } = await supabase
      .from('RECENSIONI')
      .select('id, username, condition_id, title, created_at, PATOLOGIE(id, Patologia)')
      .filter('is_published', 'eq', true)
      .order('id');
    
    if (error) {
      throw error;
    }
    
    if (!reviews || !reviews.length) {
      console.log('Nessun URL di recensione trovato');
      return;
    }
    
    // Costruisci gli URL delle recensioni
    const reviewUrls = reviews.map(review => {
      if (!review.PATOLOGIE) return null;
      
      const condition = review.PATOLOGIE.Patologia;
      const cleanedCondition = condition.toLowerCase().trim();
      
      const title = review.title || '';
      const cleanedTitle = title.toLowerCase()
                               .trim()
                               .replace(/[^\w\s-]/g, '')
                               .replace(/\s+/g, '-')
                               .replace(/--+/g, '-');
      
      return {
        id: review.id,
        url: `https://stomale.info/patologia/${cleanedCondition}/esperienza/${review.id}-${cleanedTitle}`,
        lastmod: review.created_at
      };
    }).filter(Boolean);
    
    // Dividi in chunks da 5 URL per sitemap
    const chunks = [];
    for (let i = 0; i < reviewUrls.length; i += 5) {
      chunks.push(reviewUrls.slice(i, i + 5));
    }
    
    // Genera i file XML per ogni chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const sitemapIndex = i + 1;
      
      // Ensure no leading whitespace before XML declaration
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk.map(item => `  <url>
    <loc>${item.url}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;
      
      fs.writeFileSync(`public/sitemap-reviews-${sitemapIndex}.xml`, xmlContent);
      console.log(`Generato sitemap-reviews-${sitemapIndex}.xml`);
    }
    
    // Genera il sitemap index
    // Ensure no leading whitespace before XML declaration
    const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.map((_, index) => {
  const sitemapNumber = index + 1;
  return `  <sitemap>
    <loc>https://stomale.info/sitemap-reviews-${sitemapNumber}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`;
}).join('\n')}
</sitemapindex>`;
    
    fs.writeFileSync('public/sitemap-index.xml', sitemapIndexXml);
    console.log('Generato sitemap-index.xml');
    
    console.log('Generazione sitemaps completata con successo');
  } catch (error) {
    console.error('Errore durante la generazione dei sitemaps:', error.message);
    process.exit(1);
  }
};

module.exports = generateSitemaps;

if (require.main === module) {
  generateSitemaps();
}
