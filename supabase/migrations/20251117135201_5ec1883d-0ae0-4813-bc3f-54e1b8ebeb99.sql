-- Update the populate_review_urls function to exclude high-risk reviews from sitemap
CREATE OR REPLACE FUNCTION populate_review_urls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing URLs
  DELETE FROM review_urls;
  
  -- Insert URLs only for approved reviews that are NOT high risk (ALTO or CRITICO)
  INSERT INTO review_urls (review_id, url, title, condition)
  SELECT 
    r.id,
    '/patologia/' || 
    LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(unaccent(COALESCE(p.Patologia, r.patologia, '')), '[àáâãäå]', 'a', 'gi'),
            '[èéêë]', 'e', 'gi'
          ),
          '[ìíîï]', 'i', 'gi'
        ),
        '[òóôõö]', 'o', 'gi'
      ),
      '[ùúûü]', 'u', 'gi'
    )) || 
    '/esperienza/' || 
    r.id || 
    '-' || 
    LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(unaccent(r.title), '[àáâãäå]', 'a', 'gi'),
              '[èéêë]', 'e', 'gi'
            ),
            '[ìíîï]', 'i', 'gi'
          ),
          '[òóôõö]', 'o', 'gi'
        ),
        '[ùúûü]', 'u', 'gi'
      ),
      '[^a-z0-9]+', '-', 'gi'
    )),
    r.title,
    COALESCE(p.Patologia, r.patologia)
  FROM reviews r
  LEFT JOIN "PATOLOGIE" p ON r.condition_id = p.id
  WHERE r.status = 'approved'
    AND (r.risk_category IS NULL OR r.risk_category NOT IN ('ALTO', 'CRITICO'));
END;
$$;