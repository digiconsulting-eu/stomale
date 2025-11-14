-- Aggiorna il campo patologia nelle recensioni
UPDATE reviews
SET patologia = 'NARCISISMO - DISTURBO NARCISISTICO DI PERSONALITÀ'
WHERE condition_id = 355;

-- Aggiorna gli URL delle recensioni con il nuovo nome della patologia
UPDATE review_urls
SET condition = 'NARCISISMO - DISTURBO NARCISISTICO DI PERSONALITÀ',
    url = '/patologia/narcisismo---disturbo-narcisistico-di-personalita/esperienza/' || review_id || '-' || 
          LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(
            SUBSTRING(title, 1, 50), 
            ' ', '-', 'g'), 
            '\.', '', 'g'), 
            ',', '', 'g'), 
            ':', '', 'g'))
WHERE review_id IN (
  SELECT id FROM reviews WHERE condition_id = 355
);