-- Step 1: Sposta tutte le recensioni dalla patologia duplicata (923) a quella principale con typo (537)
UPDATE reviews
SET condition_id = 537,
    patologia = 'LUPUS ERIMATOSO SISTEMICO'
WHERE condition_id = 923;

-- Step 2: Sposta i follows dalla patologia duplicata a quella principale
UPDATE condition_follows
SET condition_id = 537
WHERE condition_id = 923;

-- Step 3: Elimina la patologia duplicata (923)
DELETE FROM "PATOLOGIE"
WHERE id = 923;

-- Step 4: Ora che non c'è più il duplicato, correggi il typo nella patologia principale (537)
UPDATE "PATOLOGIE"
SET "Patologia" = 'LUPUS ERITEMATOSO SISTEMICO'
WHERE id = 537;

-- Step 5: Aggiorna gli URL delle recensioni con il nome corretto
UPDATE review_urls
SET condition = 'LUPUS ERITEMATOSO SISTEMICO'
WHERE review_id IN (
  SELECT id FROM reviews WHERE condition_id = 537
);