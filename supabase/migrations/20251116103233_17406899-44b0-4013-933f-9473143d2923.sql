-- Funzione per pulire gli slug
CREATE OR REPLACE FUNCTION clean_slug(text TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          lower(
            regexp_replace(
              regexp_replace(text, '[àáâãäå]', 'a', 'g'),
              '[èéêë]', 'e', 'g'
            )
          ),
          '\s+', '-', 'g'
        ),
        '[^\w-]+', '', 'g'
      ),
      '-+', '-', 'g'
    ),
    '^-+|-+$', '', 'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Aggiorna tutti gli URL nella tabella review_urls
UPDATE review_urls
SET url = '/patologia/' || 
          clean_slug(condition) || 
          '/esperienza/' || 
          review_id || '-' || 
          clean_slug(title)
WHERE url IS NOT NULL;

-- Crea indice per performance
CREATE INDEX IF NOT EXISTS idx_review_urls_condition ON review_urls(condition);
CREATE INDEX IF NOT EXISTS idx_review_urls_review_id ON review_urls(review_id);