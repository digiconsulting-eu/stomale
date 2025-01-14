import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  conditionId: number;
}

export const FollowButton = ({ conditionId }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [conditionId]);

  const checkFollowStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('condition_follows')
        .select('id')
        .eq('condition_id', conditionId)
        .eq('user_id', session.session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        setIsLoading(false);
        return;
      }

      setIsFollowing(!!data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsLoading(false);
    }
  };

  const toggleFollow = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Devi effettuare l'accesso per seguire una patologia");
        return;
      }

      setIsLoading(true);

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('condition_follows')
          .delete()
          .eq('condition_id', conditionId)
          .eq('user_id', session.session.user.id);

        if (error) throw error;
        
        setIsFollowing(false);
        toast.success("Non segui più questa patologia");
      } else {
        // Follow
        const { error } = await supabase
          .from('condition_follows')
          .insert({
            condition_id: conditionId,
            user_id: session.session.user.id
          });

        if (error) throw error;
        
        setIsFollowing(true);
        toast.success("Ora segui questa patologia");
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error("Si è verificato un errore");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      onClick={toggleFollow}
      disabled={isLoading}
      className="min-w-[100px]"
    >
      {isLoading ? "..." : isFollowing ? "Seguito" : "Segui"}
    </Button>
  );
};