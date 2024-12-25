import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PendingReviewsSection } from "./PendingReviewsSection";

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
  return (
    <div className="space-y-8">
      {/* Pending Reviews Section */}
      <PendingReviewsSection />

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