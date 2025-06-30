
-- Aggiungi la colonna Patologia alla tabella reviews
ALTER TABLE public.reviews 
ADD COLUMN patologia TEXT;

-- Popola la colonna Patologia per tutti i record esistenti
UPDATE public.reviews 
SET patologia = p."Patologia"
FROM public."PATOLOGIE" p 
WHERE reviews.condition_id = p.id;

-- Crea un trigger per mantenere sincronizzata la colonna Patologia quando viene inserito/aggiornato un record
CREATE OR REPLACE FUNCTION public.sync_review_patologia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se c'è un condition_id, prendi la patologia corrispondente
  IF NEW.condition_id IS NOT NULL THEN
    SELECT "Patologia" INTO NEW.patologia
    FROM public."PATOLOGIE"
    WHERE id = NEW.condition_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crea il trigger che si attiva prima di INSERT e UPDATE
DROP TRIGGER IF EXISTS trigger_sync_review_patologia ON public.reviews;
CREATE TRIGGER trigger_sync_review_patologia
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_review_patologia();
