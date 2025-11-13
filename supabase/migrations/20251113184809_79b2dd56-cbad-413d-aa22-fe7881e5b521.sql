
-- Aggiorno la patologia con le recensioni rinominandola e aggiungendo la descrizione
UPDATE "PATOLOGIE" 
SET "Patologia" = 'Tiroidite di Hashimoto',
    "Descrizione" = 'Infiammazione autoimmune della tiroide che porta a ipotiroidismo.'
WHERE id = 922;

-- Elimino la patologia duplicata senza recensioni
DELETE FROM "PATOLOGIE" WHERE id = 584;

-- Aggiorno gli URL delle recensioni per riflettere il nuovo nome
UPDATE review_urls
SET 
  url = REPLACE(url, '/patologia/morbo-di-hashimoto/', '/patologia/tiroidite-di-hashimoto/'),
  condition = 'Tiroidite di Hashimoto'
WHERE review_id IN (SELECT id FROM reviews WHERE condition_id = 922);
