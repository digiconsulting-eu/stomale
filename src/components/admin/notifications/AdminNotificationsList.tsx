import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AdminNotificationsList = () => {
  const { data: notifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  if (!notifications?.length) {
    return (
      <div className="text-gray-500">
        Non ci sono notifiche.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-4 rounded-lg border bg-white"
        >
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">
              {notification.update_type === 'new_review' 
                ? 'Nuova recensione'
                : 'Nuovo commento'
              } per {notification.condition.Patologia}
            </h3>
            <Badge variant="default" className="ml-auto">
              Nuovo
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(notification.created_at).toLocaleDateString('it-IT')}
          </p>
        </div>
      ))}
    </div>
  );
};