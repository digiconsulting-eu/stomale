
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
</urlset>
`;
      
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
    
    // Update sitemap index to include condition sitemaps
    console.log('Updating sitemap index...');
    
    // Ensure sitemap-index.xml exists with proper structure
    const indexPath = path.join(publicDir, 'sitemap-index.xml');
    
    let existingContent = '';
    let existingSitemaps = [];
    
    try {
      // Check if sitemap index exists and read it
      if (fs.existsSync(indexPath)) {
        existingContent = fs.readFileSync(indexPath, 'utf8');
        console.log('Existing sitemap index found, analyzing content');
        
        // Extract existing sitemap entries
        const regex = /<sitemap>\s*<loc>([^<]+)<\/loc>/g;
        let match;
        while ((match = regex.exec(existingContent)) !== null) {
          existingSitemaps.push(match[1]);
        }
        
        console.log(`Found existing sitemap index with ${existingSitemaps.length} entries`);
      } else {
        console.log('No existing sitemap index found, creating new one');
        existingContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</sitemapindex>`;
        fs.writeFileSync(indexPath, existingContent);
        console.log(`Created new sitemap index at ${indexPath}`);
      }
    } catch (indexError) {
      console.error('Error processing sitemap index:', indexError);
      existingContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</sitemapindex>`;
      try {
        fs.writeFileSync(indexPath, existingContent);
        console.log(`Created new sitemap index at ${indexPath} after error`);
      } catch (writeError) {
        console.error('Failed to create sitemap index:', writeError);
        throw new Error('Could not create or update sitemap index');
      }
    }
    
    // Validate existing sitemap index content
    if (!existingContent.includes('<sitemapindex') || !existingContent.includes('</sitemapindex>')) {
      console.log('Malformed sitemap index, creating new one');
      existingContent = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</sitemapindex>`;
      try {
        fs.writeFileSync(indexPath, existingContent);
        console.log(`Recreated sitemap index at ${indexPath} due to malformed content`);
      } catch (writeError) {
        console.error('Failed to recreate sitemap index:', writeError);
        throw new Error('Could not recreate sitemap index');
      }
    }
    
    // Create new sitemap entries for condition sitemaps
    const today = new Date().toISOString().split('T')[0];
    
    // Process each generated sitemap
    let updatedIndexContent = existingContent;
    let newEntriesAdded = false;
    
    for (const sitemap of generatedSitemaps) {
      const sitemapUrl = sitemap.url;
      
      // Skip if this sitemap is already in the index
      if (existingSitemaps.includes(sitemapUrl)) {
        console.log(`Sitemap ${sitemapUrl} already in index, skipping`);
        continue;
      }
      
      console.log(`Adding new sitemap to index: ${sitemapUrl}`);
      
      const newEntry = `  <sitemap>\n    <loc>${sitemapUrl}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
      
      // Find the position to insert the new entry
      const insertPosition = updatedIndexContent.indexOf('</sitemapindex>');
      if (insertPosition !== -1) {
        updatedIndexContent = 
          updatedIndexContent.substring(0, insertPosition) + 
          newEntry + 
          updatedIndexContent.substring(insertPosition);
        
        newEntriesAdded = true;
      } else {
        console.error('Could not find closing sitemapindex tag in the sitemap index');
        // Try to append it anyway at the end
        updatedIndexContent += newEntry + '</sitemapindex>';
        newEntriesAdded = true;
      }
    }
    
    // Write updated sitemap index if changes were made
    if (newEntriesAdded) {
      try {
        fs.writeFileSync(indexPath, updatedIndexContent);
        console.log(`Updated sitemap index at ${indexPath}`);
      } catch (writeError) {
        console.error('Error writing updated sitemap index:', writeError);
        throw new Error('Failed to write updated sitemap index');
      }
    } else {
      console.log('No new entries added to sitemap index');
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
