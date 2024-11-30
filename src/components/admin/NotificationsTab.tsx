import { Badge } from "@/components/ui/badge";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  onDeleteCondition?: (conditionName: string) => void;
}

export const NotificationsTab = ({ 
  notifications, 
  markNotificationAsRead,
  onDeleteCondition 
}: NotificationsTabProps) => {
  const handleDeleteCondition = (content: string) => {
    const conditionName = content.split(": ")[1];
    if (onDeleteCondition) {
      onDeleteCondition(conditionName);
    }
  };

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
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">{notification.date}</p>
            {notification.type === "new_condition" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCondition(notification.content);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Elimina patologia
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};