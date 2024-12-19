import { Badge } from "@/components/ui/badge";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: number;
  title: string;
  condition_id: number;
  status: string;
  created_at: string;
  PATOLOGIE: {
    Patologia: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  date: string;
  read: boolean;
}

interface NotificationsTabProps {
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
}

export const NotificationsTab = ({ 
  notifications, 
  markNotificationAsRead 
}: NotificationsTabProps) => {
  // Query to fetch pending reviews
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
          PATOLOGIE (
            Patologia
          )
        `)
        .eq('status', 'pending')
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

  const handleApproveReview = async (reviewId: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;
      
      toast.success("Recensione approvata con successo");
      refetchPendingReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error("Errore durante l'approvazione della recensione");
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

      if (error) throw error;
      
      toast.success("Recensione rifiutata con successo");
      refetchPendingReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error("Errore durante il rifiuto della recensione");
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Reviews Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Nuove recensioni da approvare ({pendingReviews?.length || 0})
        </h2>
        <div className="space-y-4">
          {pendingReviews?.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg border bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{review.title}</h3>
                  <p className="text-sm text-gray-500">
                    Patologia: {review.PATOLOGIE?.Patologia}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApproveReview(review.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approva
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectReview(review.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rifiuta
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {pendingReviews?.length === 0 && (
            <p className="text-gray-500">Non ci sono recensioni in attesa di approvazione.</p>
          )}
        </div>
      </Card>

      {/* Regular Notifications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Notifiche</h2>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read ? 'bg-gray-50' : 'bg-white'
            }`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">{notification.title}</h3>
              {!notification.read && (
                <Badge variant="default" className="ml-auto">
                  Nuovo
                </Badge>
              )}
            </div>
            <p className="text-gray-600 mt-1">{notification.content}</p>
            <p className="text-sm text-gray-500 mt-2">{notification.date}</p>
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-gray-500">Non ci sono notifiche.</p>
        )}
      </div>
    </div>
  );
};