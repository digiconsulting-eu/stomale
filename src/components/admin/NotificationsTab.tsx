import { Badge } from "@/components/ui/badge";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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

// Helper component for notification actions
const NotificationActions = ({ 
  type, 
  content, 
  onApprove, 
  onReject 
}: { 
  type: string; 
  content: string; 
  onApprove: () => void; 
  onReject: () => void;
}) => {
  if (type === "new_condition") {
    return (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onApprove}
        >
          <Check className="h-4 w-4 mr-1" />
          Approva
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onReject}
        >
          <X className="h-4 w-4 mr-1" />
          Rifiuta
        </Button>
      </div>
    );
  }
  return null;
};

export const NotificationsTab = ({ 
  notifications, 
  markNotificationAsRead,
  onDeleteCondition 
}: NotificationsTabProps) => {
  const handleApproveCondition = (content: string) => {
    const conditionName = content.split(": ")[1];
    
    // Get pending conditions and remove the approved one
    const pendingConditions = JSON.parse(localStorage.getItem('pendingConditions') || '[]');
    const updatedPendingConditions = pendingConditions.filter(
      (condition: string) => condition !== conditionName
    );
    localStorage.setItem('pendingConditions', JSON.stringify(updatedPendingConditions));

    // Add the condition to the approved conditions list
    const approvedConditions = JSON.parse(localStorage.getItem('approvedConditions') || '[]');
    approvedConditions.push(conditionName);
    localStorage.setItem('approvedConditions', JSON.stringify(approvedConditions));

    toast.success(`Patologia "${conditionName}" approvata con successo`);
  };

  const handleDeleteCondition = (content: string) => {
    const conditionName = content.split(": ")[1];
    
    // Remove from pending conditions
    const pendingConditions = JSON.parse(localStorage.getItem('pendingConditions') || '[]');
    const updatedPendingConditions = pendingConditions.filter(
      (condition: string) => condition !== conditionName
    );
    localStorage.setItem('pendingConditions', JSON.stringify(updatedPendingConditions));

    toast.success(`Patologia "${conditionName}" rifiutata`);
    
    if (onDeleteCondition) {
      onDeleteCondition(conditionName);
    }
  };

  // Get pending conditions from localStorage
  const pendingConditions = JSON.parse(localStorage.getItem('pendingConditions') || '[]');

  return (
    <div className="space-y-8">
      {/* Pending Conditions Section */}
      {pendingConditions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Nuove patologie da approvare</h2>
          <div className="space-y-4">
            {pendingConditions.map((condition: string) => (
              <div
                key={condition}
                className="p-4 rounded-lg border bg-white"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{condition}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApproveCondition(`Nuova patologia: ${condition}`)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approva
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCondition(`Nuova patologia: ${condition}`)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rifiuta
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Regular Notifications */}
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
              <NotificationActions
                type={notification.type}
                content={notification.content}
                onApprove={() => handleApproveCondition(notification.content)}
                onReject={() => handleDeleteCondition(notification.content)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};