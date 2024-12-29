import { Badge } from "@/components/ui/badge";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminReviewsList } from "./notifications/AdminReviewsList";
import { AdminNotificationsList } from "./notifications/AdminNotificationsList";

export const NotificationsTab = () => {
  const { data: pendingReviews, refetch: refetchPendingReviews } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: async () => {
      console.log('Fetching pending reviews...');
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          condition_id,
          status,
          created_at,
          symptoms,
          experience,
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending reviews:', error);
        throw error;
      }

      console.log('Fetched pending reviews:', data);
      return data as Review[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="space-y-8">
      {/* New Reviews Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Nuove recensioni da controllare ({pendingReviews?.length || 0})
        </h2>
        <AdminReviewsList reviews={pendingReviews || []} />
      </Card>

      {/* Regular Notifications */}
      <AdminNotificationsList />
    </div>
  );
};