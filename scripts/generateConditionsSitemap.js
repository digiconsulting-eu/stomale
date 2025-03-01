
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const generateConditionsSitemap = async () => {
  try {
    console.log('Starting conditions sitemap generation...');
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch all conditions
    const { data: conditions, error } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia')
      .order('Patologia');
    
    if (error) {
      throw error;
    }
    
    if (!conditions || !conditions.length) {
      console.log('No conditions found');
      return;
    }
    
    console.log(`Found ${conditions.length} conditions`);
    
    // Group conditions by first letter for better organization
    const groupedConditions = {};
    
    conditions.forEach(condition => {
      const firstLetter = condition.Patologia.charAt(0).toLowerCase();
      
      // Group letters from m to r together, and s to z together
      let group;
      if (firstLetter >= 'a' && firstLetter <= 'd') group = 'a';
      else if (firstLetter >= 'e' && firstLetter <= 'l') group = 'e-l';
      else if (firstLetter >= 'm' && firstLetter <= 'r') group = 'm-r';
      else if (firstLetter >= 's' && firstLetter <= 'z') group = 's-z';
      else group = 'other';
      
      if (!groupedConditions[group]) {
        groupedConditions[group] = [];
      }
      
      groupedConditions[group].push(condition);
    });
    
    // Create public/sitemaps directory if it doesn't exist
    const sitemapsDir = 'public/sitemaps';
    if (!fs.existsSync(sitemapsDir)) {
      fs.mkdirSync(sitemapsDir, { recursive: true });
    }
    
    // Generate a sitemap file for each group
    for (const [group, groupConditions] of Object.entries(groupedConditions)) {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${groupConditions.map(condition => {
  // Use encodeURIComponent for spaces in the condition name
  const cleanedCondition = encodeURIComponent(condition.Patologia.toLowerCase().trim());
  
  return `  <url>
    <loc>https://stomale.info/patologia/${cleanedCondition}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n')}
</urlset>
`;
      
      fs.writeFileSync(`${sitemapsDir}/sitemap-conditions-${group}.xml`, xmlContent);
      console.log(`Generated ${sitemapsDir}/sitemap-conditions-${group}.xml`);
    }
    
    // Generate the sitemap index
    const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(groupedConditions).map(group => `  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-${group}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
    
    fs.writeFileSync('public/sitemap-index.xml', sitemapIndexContent);
    console.log('Generated sitemap-index.xml');
    
    console.log('Conditions sitemap generation completed successfully');
  } catch (error) {
    console.error('Error during conditions sitemap generation:', error.message);
    process.exit(1);
  }
};

module.exports = generateConditionsSitemap;

if (require.main === module) {
  generateConditionsSitemap();
}
