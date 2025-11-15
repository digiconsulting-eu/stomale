-- Correggi il nome della patologia rimuovendo il trattino problematico
UPDATE "PATOLOGIE" 
SET "Patologia" = 'CARCINOMA BASOCELLULARE (BASALIOMA)'
WHERE id = 256;

-- Aggiorna anche le recensioni con il nuovo nome
UPDATE reviews 
SET patologia = 'CARCINOMA BASOCELLULARE (BASALIOMA)'
WHERE condition_id = 256;