import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NotificationsTab } from "./NotificationsTab";
import { ReviewsTab } from "./ReviewsTab";
import { CommentsTab } from "./CommentsTab";
import { UsersTab } from "./UsersTab";
import { AdminsTab } from "./AdminsTab";
import ImportTab from "./ImportTab";

interface AdminTabsProps {
  notifications: any[];
  reviews: any[];
  comments: any[];
  admins: any[];
  newAdminEmail: string;
  setNewAdminEmail: (email: string) => void;
  handleAddAdmin: () => void;
  handleReviewAction: (id: number, action: "approve" | "reject") => void;
  handleCommentAction: (id: string, action: "approve" | "reject") => void;
  markNotificationAsRead: (id: string) => void;
}

export const AdminTabs = ({
  notifications,
  reviews,
  comments,
  admins,
  newAdminEmail,
  setNewAdminEmail,
  handleAddAdmin,
  handleReviewAction,
  handleCommentAction,
  markNotificationAsRead,
}: AdminTabsProps) => {
  return (
    <Tabs defaultValue="notifications" className="w-full space-y-6">
      <TabsList className="w-full flex flex-wrap gap-2 h-auto">
        <TabsTrigger value="notifications" className="relative flex-grow basis-[calc(50%-0.25rem)] md:flex-grow-0">
          Notifiche
          {notifications.some(n => !n.read) && (
            <Badge variant="destructive" className="ml-2">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex-grow basis-[calc(50%-0.25rem)] md:flex-grow-0">
          Recensioni
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex-grow basis-[calc(50%-0.25rem)] md:flex-grow-0">
          Commenti
        </TabsTrigger>
        <TabsTrigger value="users" className="flex-grow basis-[calc(50%-0.25rem)] md:flex-grow-0">
          Utenti
        </TabsTrigger>
        <TabsTrigger value="admins" className="flex-grow basis-[calc(50%-0.25rem)] md:flex-grow-0">
          Amministratori
        </TabsTrigger>
        <TabsTrigger value="import" className="flex-grow basis-[calc(50%-0.25rem)] md:flex-grow-0">
          Import
        </TabsTrigger>
      </TabsList>

      <div className="mt-4">
        <TabsContent value="notifications" className="m-0">
          <NotificationsTab 
            notifications={notifications}
            markNotificationAsRead={markNotificationAsRead}
          />
        </TabsContent>

        <TabsContent value="reviews" className="m-0">
          <ReviewsTab 
            reviews={reviews}
            handleReviewAction={handleReviewAction}
          />
        </TabsContent>

        <TabsContent value="comments" className="m-0">
          <CommentsTab 
            comments={comments}
            handleCommentAction={handleCommentAction}
          />
        </TabsContent>

        <TabsContent value="users" className="m-0">
          <UsersTab />
        </TabsContent>

        <TabsContent value="admins" className="m-0">
          <AdminsTab 
            admins={admins}
            newAdminEmail={newAdminEmail}
            setNewAdminEmail={setNewAdminEmail}
            handleAddAdmin={handleAddAdmin}
          />
        </TabsContent>

        <TabsContent value="import" className="m-0">
          <ImportTab />
        </TabsContent>
      </div>
    </Tabs>
  );
};