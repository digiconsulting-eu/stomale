
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: string;
  content: string;
  related_review_id: number;
  related_comment_id: number;
  is_read: boolean;
  created_at: string;
}

export const NotificationsTab = () => {
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data as Notification[];
    }
  });

  const markAsRead = async (notificationId: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast.error("Errore durante l'aggiornamento della notifica");
      return;
    }

    refetch();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment_approved':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'new_comment_on_review':
      case 'new_comment_on_thread':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (!notifications?.length) {
    return (
      <Card className="p-6 md:p-8 text-center">
        <Bell className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-3 md:mb-4" />
        <p className="text-gray-500 text-sm md:text-base">Non ci sono notifiche al momento</p>
        <Button asChild variant="link" className="mt-2 text-sm md:text-base">
          <Link to="/cerca-patologia">Cerca una patologia da seguire</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`p-3 md:p-4 transition-colors ${!notification.is_read ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm md:text-base">
                {notification.content}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {new Date(notification.created_at).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
                className="flex-shrink-0 text-xs md:text-sm px-2 md:px-3 h-7 md:h-8"
              >
                Segna come letto
              </Button>
            )}
          </div>
          {notification.related_review_id && (
            <div className="mt-2 md:mt-3">
              <Button 
                variant="link" 
                asChild 
                className="p-0 h-auto font-normal text-primary text-xs md:text-sm"
              >
                <Link to={`/recensione/${notification.related_review_id}`}>
                  Vai alla recensione
                </Link>
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
