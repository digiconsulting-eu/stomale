import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

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

export const NotificationsTab = ({ notifications, markNotificationAsRead }: NotificationsTabProps) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};