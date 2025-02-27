
import fs from 'fs';
import path from 'path';
import { generateReviewsSitemap } from '../src/utils/sitemapGenerator';

async function main() {
  console.log('Generating sitemap-reviews-1.xml...');
  
  // Genera sitemap per recensioni con ID da 103 a 203
  const xmlContent = await generateReviewsSitemap(103, 203);
  
  if (xmlContent) {
    const outputPath = path.resolve(__dirname, '../public/sitemap-reviews-1.xml');
    fs.writeFileSync(outputPath, xmlContent);
    console.log(`Successfully generated sitemap at ${outputPath}`);
  } else {
    console.error('Failed to generate sitemap');
  }
}

main().catch(console.error);
