import { supabase } from "@/integrations/supabase/client";

export const fetchReviews = async () => {
  const { data, error } = await supabase
    .from('RECENSIONI')
    .select('*')
    .order('"date (data)"', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchLatestReviews = async (limit: number = 3) => {
  const { data, error } = await supabase
    .from('RECENSIONI')
    .select('*')
    .order('"date (data)"', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};