
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function main() {
  try {
    console.log('Fetching sitemap from Supabase Edge Function...');
    
    // Base URL for the Supabase function
    const functionUrl = 'https://hnuhdoycwpjfjhthfqbt.supabase.co/functions/v1/generate-reviews-sitemap';
    
    // Set parameters for reviews with ID from 103 to 203
    const url = `${functionUrl}?startId=103&endId=203`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlContent = await response.text();
    
    // Save the XML content to sitemap-reviews-1.xml
    const outputPath = path.resolve(__dirname, '../public/sitemap-reviews-1.xml');
    fs.writeFileSync(outputPath, xmlContent);
    
    console.log(`Successfully saved sitemap to ${outputPath}`);
  } catch (error) {
    console.error('Error fetching sitemap:', error);
  }
}

main();
