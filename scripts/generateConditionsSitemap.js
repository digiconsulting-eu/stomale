
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const encodeSpaces = process.env.ENCODE_SPACES === 'true';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const URLS_PER_FILE = 50;
const sitemapsDir = path.join(process.cwd(), 'public', 'sitemaps');
const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');

// Ensure the sitemaps directory exists
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

// Function to format a condition name for the URL
function formatConditionForUrl(conditionName) {
  if (encodeSpaces) {
    // Use encodeURIComponent for proper URL encoding of spaces and special characters
    return encodeURIComponent(conditionName.toLowerCase());
  } else {
    // The old way (replace spaces with hyphens)
    return conditionName.toLowerCase().replace(/\s+/g, '-');
  }
}

// Function to clean up old condition sitemap files
function cleanupOldConditionSitemaps() {
  try {
    const files = fs.readdirSync(sitemapsDir);
    files.forEach(file => {
      if (file.startsWith('sitemap-conditions-') && file.endsWith('.xml')) {
        fs.unlinkSync(path.join(sitemapsDir, file));
        console.log(`Deleted old sitemap file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up old sitemap files:', error);
  }
}

// Function to generate sitemap XML for a group of conditions
function generateSitemapXml(conditions) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  conditions.forEach(condition => {
    const formattedName = formatConditionForUrl(condition.Patologia);
    xml += '  <url>\n';
    xml += `    <loc>https://stomale.info/patologia/${formattedName}</loc>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  });
  
  xml += '</urlset>\n';
  return xml;
}

// Function to update sitemap index
function updateSitemapIndex(sitemapFiles) {
  try {
    // Read existing sitemap index
    let sitemapIndexContent = '';
    if (fs.existsSync(sitemapIndexPath)) {
      sitemapIndexContent = fs.readFileSync(sitemapIndexPath, 'utf8');
    }

    // Create new sitemap index or update existing
    if (!sitemapIndexContent || sitemapIndexContent === '') {
      // Create new sitemap index
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add static sitemap
      xml += '  <sitemap>\n';
      xml += '    <loc>https://stomale.info/sitemaps/sitemap-static.xml</loc>\n';
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '  </sitemap>\n';
      
      // Add condition sitemaps
      sitemapFiles.forEach(file => {
        xml += '  <sitemap>\n';
        xml += `    <loc>https://stomale.info/sitemaps/${file}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </sitemap>\n';
      });
      
      // Add review sitemaps (assume they exist)
      const reviewFiles = fs.readdirSync(sitemapsDir)
        .filter(file => file.startsWith('sitemap-reviews-') && file.endsWith('.xml'));
      
      reviewFiles.forEach(file => {
        xml += '  <sitemap>\n';
        xml += `    <loc>https://stomale.info/sitemaps/${file}</loc>\n`;
        xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += '  </sitemap>\n';
      });
      
      xml += '</sitemapindex>\n';
      fs.writeFileSync(sitemapIndexPath, xml);
    } else {
      // Update existing sitemap index
      let updatedContent = sitemapIndexContent;
      
      // Remove existing condition sitemap entries
      sitemapFiles.forEach(file => {
        const sitemapRegex = new RegExp(`<sitemap>[\\s\\S]*?<loc>https://stomale.info/sitemaps/${file}</loc>[\\s\\S]*?</sitemap>`, 'g');
        updatedContent = updatedContent.replace(sitemapRegex, '');
      });
      
      // Add new condition sitemap entries before the closing tag
      let newEntries = '';
      sitemapFiles.forEach(file => {
        newEntries += '  <sitemap>\n';
        newEntries += `    <loc>https://stomale.info/sitemaps/${file}</loc>\n`;
        newEntries += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
        newEntries += '  </sitemap>\n';
      });
      
      updatedContent = updatedContent.replace('</sitemapindex>', newEntries + '</sitemapindex>');
      fs.writeFileSync(sitemapIndexPath, updatedContent);
    }
    
    console.log('Updated sitemap index file');
  } catch (error) {
    console.error('Error updating sitemap index:', error);
  }
}

// Main function to generate condition sitemaps
async function generateConditionSitemaps() {
  try {
    console.log('Fetching conditions from Supabase...');
    const { data: conditions, error } = await supabase
      .from('PATOLOGIE')
      .select('id, Patologia')
      .order('Patologia');
    
    if (error) {
      throw error;
    }
    
    if (!conditions || conditions.length === 0) {
      console.log('No conditions found');
      return;
    }
    
    console.log(`Retrieved ${conditions.length} conditions`);
    
    // Clean up old sitemap files
    cleanupOldConditionSitemaps();
    
    // Group conditions by first letter
    const groupedConditions = {};
    conditions.forEach(condition => {
      const firstLetter = condition.Patologia.charAt(0).toUpperCase();
      
      if (!groupedConditions[firstLetter]) {
        groupedConditions[firstLetter] = [];
      }
      
      groupedConditions[firstLetter].push(condition);
    });
    
    // Generate sitemap files based on the groups
    const sitemapFiles = [];
    
    // Handle A, B, C, D letters individually
    ['A', 'B', 'C', 'D'].forEach(letter => {
      if (groupedConditions[letter] && groupedConditions[letter].length > 0) {
        const fileName = `sitemap-conditions-${letter.toLowerCase()}.xml`;
        const filePath = path.join(sitemapsDir, fileName);
        
        const xml = generateSitemapXml(groupedConditions[letter]);
        fs.writeFileSync(filePath, xml);
        
        sitemapFiles.push(fileName);
        console.log(`Generated ${fileName} with ${groupedConditions[letter].length} conditions`);
      }
    });
    
    // Group E-L
    const eLConditions = [];
    for (let letter = 'E'.charCodeAt(0); letter <= 'L'.charCodeAt(0); letter++) {
      const letterStr = String.fromCharCode(letter);
      if (groupedConditions[letterStr]) {
        eLConditions.push(...groupedConditions[letterStr]);
      }
    }
    
    if (eLConditions.length > 0) {
      const fileName = 'sitemap-conditions-e-l.xml';
      const filePath = path.join(sitemapsDir, fileName);
      
      const xml = generateSitemapXml(eLConditions);
      fs.writeFileSync(filePath, xml);
      
      sitemapFiles.push(fileName);
      console.log(`Generated ${fileName} with ${eLConditions.length} conditions`);
    }
    
    // Group M-R
    const mRConditions = [];
    for (let letter = 'M'.charCodeAt(0); letter <= 'R'.charCodeAt(0); letter++) {
      const letterStr = String.fromCharCode(letter);
      if (groupedConditions[letterStr]) {
        mRConditions.push(...groupedConditions[letterStr]);
      }
    }
    
    if (mRConditions.length > 0) {
      const fileName = 'sitemap-conditions-m-r.xml';
      const filePath = path.join(sitemapsDir, fileName);
      
      const xml = generateSitemapXml(mRConditions);
      fs.writeFileSync(filePath, xml);
      
      sitemapFiles.push(fileName);
      console.log(`Generated ${fileName} with ${mRConditions.length} conditions`);
    }
    
    // Group S-Z
    const sZConditions = [];
    for (let letter = 'S'.charCodeAt(0); letter <= 'Z'.charCodeAt(0); letter++) {
      const letterStr = String.fromCharCode(letter);
      if (groupedConditions[letterStr]) {
        sZConditions.push(...groupedConditions[letterStr]);
      }
    }
    
    if (sZConditions.length > 0) {
      const fileName = 'sitemap-conditions-s-z.xml';
      const filePath = path.join(sitemapsDir, fileName);
      
      const xml = generateSitemapXml(sZConditions);
      fs.writeFileSync(filePath, xml);
      
      sitemapFiles.push(fileName);
      console.log(`Generated ${fileName} with ${sZConditions.length} conditions`);
    }
    
    // Update sitemap index
    updateSitemapIndex(sitemapFiles);
    
    console.log('All condition sitemaps generated successfully');
  } catch (error) {
    console.error('Error generating condition sitemaps:', error);
    process.exit(1);
  }
}

// Execute the main function
generateConditionSitemaps();
