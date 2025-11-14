-- Step 1: Sposta tutte le recensioni dall'ID 915 all'ID 355 (che ha già il nome corretto)
UPDATE reviews
SET condition_id = 355,
    patologia = 'DISTURBO NARCISISTICO DI PERSONALITÀ'
WHERE condition_id IN (915, 868);

-- Step 2: Sposta eventuali follows all'ID 355
UPDATE condition_follows
SET condition_id = 355
WHERE condition_id IN (915, 868);

-- Step 3: Aggiorna la descrizione dell'ID 355 con quella più completa
UPDATE "PATOLOGIE"
SET "Descrizione" = 'Bisogno costante di ammirazione, un senso esagerato della propria importanza e una mancanza di empatia verso gli altri. Le persone con questo disturbo tendono a cercare l''attenzione e a sentirsi superiori, spesso risultando arroganti o manipolative.'
WHERE id = 355;

-- Step 4: Aggiorna gli URL delle recensioni
UPDATE review_urls
SET condition = 'DISTURBO NARCISISTICO DI PERSONALITÀ',
    url = '/patologia/disturbo-narcisistico-di-personalita/esperienza/' || review_id || '-' || 
          LOWER(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(
            SUBSTRING(title, 1, 50), 
            ' ', '-', 'g'), 
            '\.', '', 'g'), 
            ',', '', 'g'), 
            ':', '', 'g'))
WHERE review_id IN (
  SELECT id FROM reviews WHERE condition_id = 355
);

-- Step 5: Elimina le patologie duplicate
DELETE FROM "PATOLOGIE"
WHERE id IN (915, 868);