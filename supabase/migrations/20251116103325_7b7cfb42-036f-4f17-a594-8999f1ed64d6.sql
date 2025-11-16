-- Fix security warning: set search_path for clean_slug function
DROP FUNCTION IF EXISTS clean_slug(TEXT);

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
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = 'public';