
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const regenerateSitemaps = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('sitemap-reviews', {
      method: 'POST'
    });

    if (error) {
      console.error('Error regenerating sitemaps:', error);
      toast.error('Errore durante la rigenerazione dei sitemap');
      throw error;
    }

    console.log('Sitemap regeneration response:', data);
    toast.success(`Sitemap rigenerati con successo! Recensioni totali: ${data.total_reviews}, File creati: ${data.chunks_created}`);
    return data;
  } catch (error) {
    console.error('Error in regenerateSitemaps:', error);
    toast.error('Errore durante la rigenerazione dei sitemap');
    throw error;
  }
};
