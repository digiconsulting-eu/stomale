
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Comment } from "./types";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

export const useComments = (reviewId: string, session: Session | null) => {
  return useQuery({
    queryKey: ['comments', reviewId],
    queryFn: async () => {
      console.log('Fetching comments for review:', reviewId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          status,
          user_id,
          users (
            username
          )
        `)
        .eq('review_id', parseInt(reviewId))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Fetched comments:', data);
      
      // Further process the comments to ensure we have proper usernames
      const processedComments = await Promise.all((data || []).map(async (comment) => {
        if (!comment.users?.username && comment.user_id) {
          // If we don't have a username in the join, try to fetch it directly
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', comment.user_id)
            .single();
            
          if (!userError && userData) {
            return {
              ...comment,
              users: { username: userData.username }
            };
          }
        }
        return comment;
      }));
      
      return processedComments.filter(comment => 
        comment.status === 'approved' || 
        (session?.user.id && comment.user_id === session.user.id)
      ) as Comment[];
    },
    enabled: true,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
        toast.error('Errore nel caricamento dei commenti');
      }
    }
  });
};
