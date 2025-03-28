import { supabase } from "@/integrations/supabase/client";

interface SitemapFile {
  filename: string;
  url_count: number;
  urls?: string[];
}

interface SitemapUrl {
  loc: string;
  isValid?: boolean;
}

/**
 * Extracts URLs from an XML sitemap file
 */
export const extractUrlsFromXml = (xml: string): string[] => {
  const urlRegex = /<loc>(.*?)<\/loc>/g;
  const matches = [...xml.matchAll(urlRegex)];
  return matches.map(match => match[1]);
};

/**
 * Parses a review URL to extract condition and review ID
 */
export const parseReviewUrl = (url: string): { condition: string; reviewId: string } | null => {
  // URL format: https://stomale.info/patologia/{condition}/esperienza/{reviewId}-{slug}
  const regex = /\/patologia\/([^\/]+)\/esperienza\/(\d+)/;
  const match = url.match(regex);
  
  if (!match) return null;
  
  return {
    condition: match[1],
    reviewId: match[2]
  };
};

/**
 * Checks if a review URL is valid (exists in the database)
 */
export const validateReviewUrl = async (url: string): Promise<boolean> => {
  const parsed = parseReviewUrl(url);
  if (!parsed) return false;

  const { condition, reviewId } = parsed;
  
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id, 
      PATOLOGIE!inner(
        Patologia
      )
    `)
    .eq('id', parseInt(reviewId, 10))
    .single();

  if (error || !data) {
    console.error(`Error validating URL ${url}:`, error);
    return false;
  }

  // Check if the condition in the URL matches the patologia in the database
  // First, normalize both to lowercase with hyphens
  const urlCondition = condition.toLowerCase();
  const dbCondition = data.PATOLOGIE?.Patologia?.toLowerCase().replace(/\s+/g, '-') || '';
  
  const isValid = urlCondition === dbCondition;
  
  if (!isValid) {
    console.warn(`Mismatched condition for review ${reviewId}: URL has "${urlCondition}" but DB has "${dbCondition}"`);
  }
  
  return isValid;
};

/**
 * Gets a list of all sitemap files in the database
 */
export const getSitemapFiles = async (): Promise<SitemapFile[]> => {
  const { data, error } = await supabase
    .from('sitemap_files')
    .select('filename, url_count')
    .order('filename', { ascending: true });
    
  if (error) {
    console.error('Error fetching sitemap files:', error);
    return [];
  }
  
  return data || [];
};

/**
 * Fetches the content of a sitemap file
 */
export const fetchSitemapContent = async (filename: string): Promise<string | null> => {
  try {
    const response = await fetch(`/sitemaps/${filename}`);
    if (!response.ok) {
      console.error(`Failed to fetch sitemap ${filename}: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching sitemap ${filename}:`, error);
    return null;
  }
};

/**
 * Analyzes a sitemap file and returns a list of URLs and their validation status
 */
export const analyzeSitemap = async (filename: string): Promise<SitemapUrl[]> => {
  const content = await fetchSitemapContent(filename);
  if (!content) return [];
  
  const urls = extractUrlsFromXml(content);
  
  // Filter for review URLs only
  const reviewUrls = urls.filter(url => 
    url.includes('/patologia/') && url.includes('/esperienza/')
  );
  
  // For each URL, check if it's valid
  const validationPromises = reviewUrls.map(async (url) => {
    const isValid = await validateReviewUrl(url);
    return { loc: url, isValid };
  });
  
  return await Promise.all(validationPromises);
};

/**
 * Analyzes all review sitemap files and returns a summary
 */
export const analyzeAllSitemaps = async (): Promise<{
  totalUrls: number;
  validUrls: number;
  invalidUrls: number;
  invalidUrlsList: string[];
}> => {
  const sitemapFiles = await getSitemapFiles();
  
  // Filter for review sitemap files only
  const reviewSitemaps = sitemapFiles.filter(file => 
    file.filename.startsWith('sitemap-reviews')
  );
  
  let allUrls: SitemapUrl[] = [];
  
  // Analyze each sitemap file
  for (const sitemap of reviewSitemaps) {
    const urls = await analyzeSitemap(sitemap.filename);
    allUrls = [...allUrls, ...urls];
  }
  
  // Count valid and invalid URLs
  const validUrls = allUrls.filter(url => url.isValid).length;
  const invalidUrls = allUrls.filter(url => !url.isValid).length;
  const invalidUrlsList = allUrls
    .filter(url => !url.isValid)
    .map(url => url.loc);
  
  return {
    totalUrls: allUrls.length,
    validUrls,
    invalidUrls,
    invalidUrlsList
  };
};
