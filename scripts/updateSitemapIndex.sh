#!/bin/bash

# Script to update sitemap-index.xml with all available sitemaps
echo "🚀 Updating sitemap-index.xml..."

# Run the Node.js script
node scripts/generateSitemapIndex.js

echo "✅ Done! You can now submit the updated sitemap-index.xml to Google Search Console"
echo "📍 URL: https://stomale.info/sitemap-index.xml"
