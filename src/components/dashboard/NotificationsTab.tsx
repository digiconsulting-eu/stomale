import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Update {
  id: number;
  condition: {
    Patologia: string;
  };
  update_type: string;
  created_at: string;
}

export const NotificationsTab = () => {
  const { data: updates } = useQuery({
    queryKey: ['condition-updates'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      // Get user's followed conditions
      const { data: followedConditions } = await supabase
        .from('condition_follows')
        .select('condition_id')
        .eq('user_id', session.session.user.id);

      // Get user's reviews to know which conditions they've reviewed
      const { data: userReviews } = await supabase
        .from('reviews')
        .select('id, condition_id')
        .eq('username', session.session.user.username);

      if (!followedConditions && !userReviews) return [];

      const followedConditionIds = followedConditions?.map(f => f.condition_id) || [];
      const reviewedConditionIds = userReviews?.map(r => r.condition_id) || [];
      const userReviewIds = userReviews?.map(r => r.id) || [];

      // Get updates for followed conditions or comments on user's reviews
      const { data, error } = await supabase
        .from('condition_updates')
        .select(`
          id,
          update_type,
          created_at,
          condition:PATOLOGIE (
            Patologia
          )
        `)
        .or(`condition_id.in.(${[...followedConditionIds, ...reviewedConditionIds].join(',')}),review_id.in.(${userReviewIds.join(',')})`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching updates:', error);
        throw error;
      }

      return data as Update[];
    }
  });

  if (!updates?.length) {
    return (
      <Card className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Non ci sono aggiornamenti al momento</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/cerca-patologia">Cerca una patologia da seguire</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card key={update.id} className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">
              {update.update_type === 'new_review' 
                ? 'Nuova recensione per'
                : 'Nuovo commento su'} {update.condition.Patologia}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(update.created_at).toLocaleDateString('it-IT')}
          </p>
        </Card>
      ))}
    </div>
  );
};