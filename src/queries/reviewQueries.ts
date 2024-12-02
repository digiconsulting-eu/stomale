import { supabase } from "@/integrations/supabase/client";

export const fetchReviews = async () => {
  const { data, error } = await supabase
    .from('RECENSIONI')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchReviewsByCondition = async (condition: string) => {
  const { data, error } = await supabase
    .from('RECENSIONI')
    .select('*')
    .eq('condition (patologia)', condition)
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchLatestReviews = async (limit: number = 3) => {
  const { data, error } = await supabase
    .from('RECENSIONI')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};