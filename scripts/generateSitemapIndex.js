import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const publicDir = join(process.cwd(), 'public');
const sitemapsDir = join(publicDir, 'sitemaps');

// Get all sitemap files from public directory
const reviewSitemaps = readdirSync(publicDir)
  .filter(file => file.startsWith('sitemap-reviews-') && file.endsWith('.xml'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

// Get all sitemaps from sitemaps directory
const conditionSitemaps = readdirSync(sitemapsDir)
  .filter(file => file.startsWith('sitemap-conditions-') && file.endsWith('.xml'))
  .sort();

const staticSitemap = 'sitemap-static.xml';

// Current date in YYYY-MM-DD format
const lastmod = new Date().toISOString().split('T')[0];

// Generate sitemap index XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://stomale.info/sitemaps/${staticSitemap}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
`;

// Add condition sitemaps
conditionSitemaps.forEach(file => {
  xml += `  <sitemap>
    <loc>https://stomale.info/sitemaps/${file}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
`;
});

// Add review sitemaps
reviewSitemaps.forEach(file => {
  xml += `  <sitemap>
    <loc>https://stomale.info/${file}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
`;
});

xml += `</sitemapindex>`;

// Write the sitemap index
const outputPath = join(publicDir, 'sitemap-index.xml');
writeFileSync(outputPath, xml);

console.log(`✅ Sitemap index generated successfully!`);
console.log(`📊 Stats:`);
console.log(`   - Static sitemaps: 1`);
console.log(`   - Condition sitemaps: ${conditionSitemaps.length}`);
console.log(`   - Review sitemaps: ${reviewSitemaps.length}`);
console.log(`   - Total sitemaps: ${1 + conditionSitemaps.length + reviewSitemaps.length}`);
console.log(`   - Last modified: ${lastmod}`);
