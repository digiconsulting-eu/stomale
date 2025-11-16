-- Migliora la funzione clean_slug per gestire tutti i caratteri speciali
DROP FUNCTION IF EXISTS clean_slug(TEXT);

CREATE OR REPLACE FUNCTION clean_slug(text TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN substring(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            lower(
              -- Rimuovi tutti gli accenti usando unaccent se disponibile, altrimenti sostituisci manualmente
              translate(
                text,
                'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ',
                'aaaaaaeeeeiiiioooooouuuuyyncaaaaaaeeeeiiiioooooouuuuyync'
              )
            ),
            '\s+', '-', 'g'  -- Spazi -> trattini
          ),
          '[^\w\-]', '', 'g'  -- Rimuovi tutto tranne lettere, numeri e trattini
        ),
        '\-+', '-', 'g'  -- Multipli trattini -> singolo
      ),
      '^\-+|\-+$', '', 'g'  -- Rimuovi trattini iniziali/finali
    ),
    1, 70  -- Limita a 70 caratteri
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = 'public';

-- Rigenera TUTTI gli URL con la funzione migliorata
UPDATE review_urls
SET url = '/patologia/' || 
          clean_slug(condition) || 
          '/esperienza/' || 
          review_id || '-' || 
          clean_slug(title);