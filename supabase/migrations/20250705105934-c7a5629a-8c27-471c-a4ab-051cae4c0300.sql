
-- Aggiorna tutte le recensioni esistenti con likes casuali da 1 a 10
UPDATE public.reviews 
SET likes_count = floor(random() * 10 + 1)::integer
WHERE likes_count = 0 OR likes_count IS NULL;
