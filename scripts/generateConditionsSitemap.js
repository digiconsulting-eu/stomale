const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Ensure the sitemaps directory exists
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    console.log(`Creating directory: ${directory}`);
    fs.mkdirSync(directory, { recursive: true });
  }
};

const generateConditionsSitemap = async () => {
  try {
    console.log('Starting condition sitemap generation...');
    
    // Initialize the Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch conditions
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
    
    // Ensure the sitemaps directory exists
    const sitemapsDir = path.join(process.cwd(), 'public', 'sitemaps');
    ensureDirectoryExists(sitemapsDir);
    
    // Group conditions alphabetically
    const groupedConditions = {
      'a': [],
      'b': [],
      'c': [],
      'd': [],
      'e-l': [],
      'm-r': [],
      's-z': []
    };
    
    conditions.forEach(condition => {
      const firstChar = condition.Patologia.charAt(0).toLowerCase();
      
      if ('abcd'.includes(firstChar)) {
        groupedConditions[firstChar].push(condition);
      } else if ('efghijkl'.includes(firstChar)) {
        groupedConditions['e-l'].push(condition);
      } else if ('mnopqr'.includes(firstChar)) {
        groupedConditions['m-r'].push(condition);
      } else {
        groupedConditions['s-z'].push(condition);
      }
    });
    
    // Generate sitemap for each group
    for (const [group, groupConditions] of Object.entries(groupedConditions)) {
      if (groupConditions.length === 0) continue;
      
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${groupConditions.map(condition => {
  // Use encodeURIComponent for spaces
  const encodedCondition = encodeURIComponent(condition.Patologia.toLowerCase());
  return `  <url>
    <loc>https://stomale.info/patologia/${encodedCondition}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n')}
</urlset>
`;
      
      const filePath = path.join(sitemapsDir, `sitemap-conditions-${group}.xml`);
      fs.writeFileSync(filePath, xmlContent);
      console.log(`Generated ${filePath}`);
    }
    
    // Update sitemap index to include condition sitemaps
    const indexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');
    
    // Create original sitemap index content if it doesn't exist
    let originalContent = '';
    if (fs.existsSync(indexPath)) {
      originalContent = fs.readFileSync(indexPath, 'utf8');
    }
    
    const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Object.keys(groupedConditions).map(group => `
  <sitemap>
    <loc>https://stomale.info/sitemaps/sitemap-conditions-${group}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('')}
  <!-- Other sitemaps can be added here -->
${originalContent.includes('<!-- Other sitemaps can be added here -->') ? '' : originalContent.split('<sitemapindex')[1]?.split('</sitemapindex>')[0] || ''}
</sitemapindex>
`;
    
    fs.writeFileSync(indexPath, sitemapIndexContent);
    console.log(`Updated sitemap index at ${indexPath}`);
    
    console.log('Condition sitemap generation completed successfully');
  } catch (error) {
    console.error('Error during condition sitemap generation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

module.exports = generateConditionsSitemap;

if (require.main === module) {
  generateConditionsSitemap();
}
