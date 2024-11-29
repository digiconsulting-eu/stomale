import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/components/ReviewCard";
import { NotificationsTab } from "@/components/admin/NotificationsTab";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserReview {
  id: string;
  title: string;
  condition: string;
  preview: string;
  date: string;
}

interface UserComment {
  id: string;
  reviewId: string;
  reviewTitle: string;
  content: string;
  date: string;
}

interface UserData {
  username: string;
  email: string;
  registrationNumber: number;
  joinDate: string;
}

export default function UserDashboard() {
  // In a real app, these would come from an API
  const [userData] = useState<UserData>({
    username: "Anonimo 1",
    email: "user@example.com",
    registrationNumber: 1,
    joinDate: "2024-02-25"
  });

  const [reviews] = useState<UserReview[]>([
    {
      id: "1",
      title: "La mia esperienza con l'emicrania",
      condition: "Emicrania",
      preview: "Ho sofferto di emicrania per anni...",
      date: "2024-02-25"
    }
  ]);

  const [comments] = useState<UserComment[]>([
    {
      id: "1",
      reviewId: "2",
      reviewTitle: "Esperienza con artrite",
      content: "Grazie per aver condiviso la tua esperienza...",
      date: "2024-02-25"
    }
  ]);

  const [notifications] = useState([
    {
      id: "1",
      type: "comment",
      title: "Nuovo commento",
      content: "Qualcuno ha commentato la tua recensione sull'emicrania",
      date: "2024-02-25",
      read: false
    }
  ]);

  const handleDeleteReview = (reviewId: string) => {
    // In a real app, this would call an API
    toast.success("Recensione eliminata con successo");
  };

  const handleDeleteComment = (commentId: string) => {
    // In a real app, this would call an API
    toast.success("Commento eliminato con successo");
  };

  const markNotificationAsRead = (notificationId: string) => {
    // In a real app, this would call an API
    console.log("Marking notification as read:", notificationId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Il tuo profilo</h1>
      
      <Card className="p-6 mb-8">
        <div className="grid gap-4">
          <div>
            <h2 className="font-semibold">Username</h2>
            <p className="text-gray-600">{userData.username}</p>
          </div>
          <div>
            <h2 className="font-semibold">Email</h2>
            <p className="text-gray-600">{userData.email}</p>
          </div>
          <div>
            <h2 className="font-semibold">Data di registrazione</h2>
            <p className="text-gray-600">{userData.joinDate}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews">Le tue recensioni</TabsTrigger>
          <TabsTrigger value="comments">I tuoi commenti</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="relative">
              <ReviewCard {...review} />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => handleDeleteReview(review.id)}
              >
                Elimina
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{comment.reviewTitle}</h3>
                  <p className="text-sm text-gray-500">{comment.date}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Elimina
                </Button>
              </div>
              <p className="text-gray-600">{comment.content}</p>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab
            notifications={notifications}
            markNotificationAsRead={markNotificationAsRead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}