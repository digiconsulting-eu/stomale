import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const FavoritesTab = () => {
  const { data: followedConditions, refetch } = useQuery({
    queryKey: ['followed-conditions'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from('condition_follows')
        .select(`
          condition:PATOLOGIE (
            id,
            Patologia
          ),
          last_checked_at
        `)
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: updates } = useQuery({
    queryKey: ['condition-updates'],
    queryFn: async () => {
      if (!followedConditions?.length) return {};

      const { data, error } = await supabase
        .from('condition_updates')
        .select('condition_id, update_type, created_at')
        .in('condition_id', followedConditions.map(fc => fc.condition.id))
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group updates by condition
      const updatesByCondition = data.reduce((acc: { [key: string]: number }, update) => {
        acc[update.condition_id] = (acc[update.condition_id] || 0) + 1;
        return acc;
      }, {});

      return updatesByCondition;
    },
    enabled: !!followedConditions?.length
  });

  const handleUnfollow = async (conditionId: number) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Devi effettuare l'accesso");
        return;
      }

      const { error } = await supabase
        .from('condition_follows')
        .delete()
        .eq('condition_id', conditionId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      refetch();
      toast.success("Patologia rimossa dai preferiti");
    } catch (error) {
      console.error('Error unfollowing condition:', error);
      toast.error("Si è verificato un errore");
    }
  };

  if (!followedConditions?.length) {
    return (
      <Card className="p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Non hai ancora salvato patologie preferite</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/cerca-patologia">Cerca una patologia</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {followedConditions.map((follow) => (
        <Card key={follow.condition.id} className="p-4">
          <div className="flex justify-between items-start">
            <Link 
              to={`/patologia/${follow.condition.Patologia.toLowerCase()}`}
              className="text-lg font-semibold text-primary hover:underline relative"
            >
              {follow.condition.Patologia}
              {updates && updates[follow.condition.id] > 0 && (
                <NotificationBadge count={updates[follow.condition.id]} />
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleUnfollow(follow.condition.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};