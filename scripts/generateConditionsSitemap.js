
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the directory exists
const ensureDirectoryExists = (directory) => {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Creating directory: ${directory}`);
      fs.mkdirSync(directory, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error(`Error creating directory ${directory}:`, error);
    return false;
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
    
    console.log('Supabase credentials verified, connecting to database...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch conditions
    console.log('Fetching conditions from the database...');
    const { data: conditions, error } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia')
      .order('Patologia');
    
    if (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
    
    if (!conditions || !conditions.length) {
      console.log('No conditions found in the database');
      return;
    }
    
    console.log(`Found ${conditions.length} conditions`);
    
    // Ensure the sitemaps directory exists
    const publicDir = path.join(process.cwd(), 'public');
    const sitemapsDir = path.join(publicDir, 'sitemaps');
    
    if (!ensureDirectoryExists(publicDir)) {
      throw new Error('Failed to create or verify public directory');
    }
    
    if (!ensureDirectoryExists(sitemapsDir)) {
      throw new Error('Failed to create or verify sitemaps directory');
    }
    
    console.log('Directories verified, proceeding with sitemap generation');
    
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
    
    console.log('Conditions grouped by first letter, generating sitemaps');
    
    // Track successfully generated sitemaps
    const generatedSitemaps = [];
    
    // Generate sitemap for each group
    for (const [group, groupConditions] of Object.entries(groupedConditions)) {
      if (groupConditions.length === 0) {
        console.log(`No conditions for group ${group}, skipping`);
        continue;
      }
      
      console.log(`Generating sitemap for group ${group} with ${groupConditions.length} conditions`);
      
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
</urlset>`;
      
      const filePath = path.join(sitemapsDir, `sitemap-conditions-${group}.xml`);
      try {
        fs.writeFileSync(filePath, xmlContent);
        console.log(`Successfully generated ${filePath}`);
        generatedSitemaps.push({
          group,
          path: filePath,
          url: `https://stomale.info/sitemaps/sitemap-conditions-${group}.xml`
        });
      } catch (writeError) {
        console.error(`Error writing sitemap file ${filePath}:`, writeError);
      }
    }
    
    // Update sitemap index
    console.log('Creating new sitemap index...');

    // Get the current date
    const today = new Date().toISOString().split('T')[0];
    
    // Create sitemap index with exactly one XML declaration
    const reviewPages = [1, 3, 67, 68, 73, 74, 77, 79, 81, 82, 86, 89, 90, 91, 150, 151, 178];
    
    let newSitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Add review sitemap entries
    for (const fileNum of reviewPages) {
      newSitemapIndex += `  <sitemap>
    <loc>https://stomale.info/sitemap-reviews-${fileNum}.xml</loc>
    <lastmod>2023-10-19T08:00:00+00:00</lastmod>
  </sitemap>\n`;
    }
    
    // Add generated condition sitemaps
    for (const sitemap of generatedSitemaps) {
      newSitemapIndex += `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>\n`;
    }
    
    // Close the sitemapindex tag
    newSitemapIndex += `</sitemapindex>`;
    
    // Write the new sitemap index
    try {
      const indexPath = path.join(publicDir, 'sitemap-index.xml');
      
      fs.writeFileSync(indexPath, newSitemapIndex);
      console.log(`Successfully created new sitemap index at ${indexPath}`);
      
      // Verify the file was written correctly
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        console.log(`First 50 characters of written file: "${content.substring(0, 50)}"`);
        
        // Count XML declarations
        const xmlDeclCount = (content.match(/<?xml/g) || []).length;
        console.log(`Number of XML declarations in file: ${xmlDeclCount}`);
        
        if (xmlDeclCount !== 1) {
          console.error('WARNING: File has incorrect number of XML declarations!');
        }
      }
    } catch (writeError) {
      console.error('Error writing sitemap index:', writeError);
      throw writeError;
    }
    
    console.log('Condition sitemap generation completed successfully');
    return { success: true, message: 'Condition sitemap generation completed successfully' };
  } catch (error) {
    console.error('Error during condition sitemap generation:', error.message);
    console.error(error.stack);
    return { success: false, message: error.message, stack: error.stack };
  }
};

// Execute the function if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateConditionsSitemap()
    .then(result => {
      if (!result || !result.success) {
        console.error('Sitemap generation failed:', result?.message || 'Unknown error');
        process.exit(1);
      } else {
        console.log('Sitemap generation succeeded:', result.message);
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Unhandled error in sitemap generation:', error);
      process.exit(1);
    });
}

export default generateConditionsSitemap;
