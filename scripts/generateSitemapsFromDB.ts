import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || 'https://hnuhdoycwpjfjhthfqbt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudWhkb3ljd3BqZmpodGhmcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwOTAxOTcsImV4cCI6MjA0ODY2NjE5N30.oE_g8iFcu9UdsHeZhFLYpArJWa7hNFWnsR5x1E8ZGA0';

const supabase = createClient(supabaseUrl, supabaseKey);

const URLS_PER_SITEMAP = 5; // 5 URLs per file as per existing structure
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

interface ReviewUrl {
  id: number;
  url: string;
  review_id: number;
}

async function generateSitemaps() {
  console.log('🚀 Starting sitemap generation from database...');
  
  // Fetch all URLs from review_urls table
  const { data: reviewUrls, error } = await supabase
    .from('review_urls')
    .select('id, url, review_id')
    .order('id', { ascending: true });

  if (error) {
    console.error('❌ Error fetching review URLs:', error);
    return;
  }

  if (!reviewUrls || reviewUrls.length === 0) {
    console.warn('⚠️  No review URLs found in database');
    return;
  }

  console.log(`📊 Found ${reviewUrls.length} URLs to process`);

  // Split URLs into chunks
  const chunks: ReviewUrl[][] = [];
  for (let i = 0; i < reviewUrls.length; i += URLS_PER_SITEMAP) {
    chunks.push(reviewUrls.slice(i, i + URLS_PER_SITEMAP));
  }

  console.log(`📦 Creating ${chunks.length} sitemap files...`);

  // Generate sitemap files
  const sitemapFiles: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunkNumber = i + 1;
    const filename = `sitemap-reviews-${chunkNumber}.xml`;
    const filepath = path.join(PUBLIC_DIR, filename);
    
    const xmlContent = generateSitemapXML(chunks[i]);
    fs.writeFileSync(filepath, xmlContent, 'utf-8');
    
    sitemapFiles.push(filename);
    
    if (chunkNumber % 10 === 0) {
      console.log(`  ✓ Generated ${chunkNumber}/${chunks.length} files...`);
    }
  }

  console.log(`✅ Generated ${sitemapFiles.length} sitemap files`);

  // Generate sitemap index
  console.log('📑 Generating sitemap index...');
  const indexContent = generateSitemapIndex(sitemapFiles);
  const indexPath = path.join(PUBLIC_DIR, 'sitemap-index.xml');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  
  console.log('✅ Sitemap index generated');
  console.log('\n🎉 Sitemap generation completed successfully!');
  console.log(`   Total URLs: ${reviewUrls.length}`);
  console.log(`   Total files: ${sitemapFiles.length}`);
}

function generateSitemapXML(urls: ReviewUrl[]): string {
  const lastmod = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const urlData of urls) {
    xml += `  <url>
    <loc>https://stomale.info${urlData.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

function generateSitemapIndex(sitemapFiles: string[]): string {
  const lastmod = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const filename of sitemapFiles) {
    xml += `  <sitemap>
    <loc>https://stomale.info/${filename}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
`;
  }

  xml += `</sitemapindex>`;
  return xml;
}

// Run the script
generateSitemaps().catch(console.error);
