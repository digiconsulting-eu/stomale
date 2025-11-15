-- Sposta le recensioni dalla patologia duplicata "CARCINOMA BASO-CELLULARE" (id:861)
-- alla patologia corretta "CARCINOMA BASO-CELLULARE (BASALIOMA)" (id:256)
UPDATE reviews 
SET 
  condition_id = 256,
  patologia = 'CARCINOMA BASO-CELLULARE (BASALIOMA)'
WHERE condition_id = 861;

-- Elimina la patologia duplicata
DELETE FROM "PATOLOGIE" WHERE id = 861;