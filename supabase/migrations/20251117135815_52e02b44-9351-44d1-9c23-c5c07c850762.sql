-- Create a trigger to update review_urls when risk_category changes
CREATE OR REPLACE FUNCTION update_review_urls_on_risk_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  review_url text;
  url_exists boolean;
BEGIN
  -- Check if risk_category actually changed
  IF (TG_OP = 'UPDATE' AND OLD.risk_category IS DISTINCT FROM NEW.risk_category) OR TG_OP = 'INSERT' THEN
    
    -- Generate the URL for this review
    SELECT '/patologia/' || 
      LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(unaccent(COALESCE(p.Patologia, NEW.patologia, '')), '[àáâãäå]', 'a', 'gi'),
              '[èéêë]', 'e', 'gi'
            ),
            '[ìíîï]', 'i', 'gi'
          ),
          '[òóôõö]', 'o', 'gi'
        ),
        '[ùúûü]', 'u', 'gi'
      )) || 
      '/esperienza/' || 
      NEW.id || 
      '-' || 
      LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(unaccent(NEW.title), '[àáâãäå]', 'a', 'gi'),
                '[èéêë]', 'e', 'gi'
              ),
              '[ìíîï]', 'i', 'gi'
            ),
            '[òóôõö]', 'o', 'gi'
          ),
          '[ùúûü]', 'u', 'gi'
        ),
        '[^a-z0-9]+', '-', 'gi'
      ))
    INTO review_url
    FROM "PATOLOGIE" p
    WHERE p.id = NEW.condition_id;
    
    -- Check if URL exists
    SELECT EXISTS(SELECT 1 FROM review_urls WHERE review_id = NEW.id) INTO url_exists;
    
    -- If review is approved and NOT high risk (ALTO or CRITICO)
    IF NEW.status = 'approved' AND (NEW.risk_category IS NULL OR NEW.risk_category NOT IN ('ALTO', 'CRITICO')) THEN
      -- Insert or update the URL
      IF url_exists THEN
        UPDATE review_urls 
        SET url = review_url, 
            title = NEW.title, 
            condition = COALESCE((SELECT Patologia FROM "PATOLOGIE" WHERE id = NEW.condition_id), NEW.patologia)
        WHERE review_id = NEW.id;
      ELSE
        INSERT INTO review_urls (review_id, url, title, condition)
        VALUES (
          NEW.id, 
          review_url, 
          NEW.title, 
          COALESCE((SELECT Patologia FROM "PATOLOGIE" WHERE id = NEW.condition_id), NEW.patologia)
        );
      END IF;
    ELSE
      -- If high risk or not approved, remove from sitemap
      DELETE FROM review_urls WHERE review_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trg_update_review_urls_on_risk_change ON reviews;
CREATE TRIGGER trg_update_review_urls_on_risk_change
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_review_urls_on_risk_change();