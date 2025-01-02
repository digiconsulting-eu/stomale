import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const decodeReviewTitle = (slug: string) => {
  return decodeURIComponent(slug)
    .split('-')
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/allovaio/g, "all'ovaio")
    .replace(/loperazione/g, "l'operazione")
    .trim();
};

export const useReviewQuery = (slug: string | undefined, condition: string | undefined) => {
  return useQuery({
    queryKey: ['review', slug, condition],
    queryFn: async () => {
      console.log('Fetching review with slug:', slug);
      console.log('Condition:', condition);
      
      const decodedTitle = decodeReviewTitle(slug || '');
      console.log('Decoded title:', decodedTitle);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('status', 'approved')
        .eq('PATOLOGIE.Patologia', decodeURIComponent(condition || '').toUpperCase())
        .eq('title', decodedTitle)
        .maybeSingle();

      if (error) {
        console.error('Error fetching review:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No review found with these parameters');
        return null;
      }

      console.log('Fetched review:', data);
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
    }
  });
};