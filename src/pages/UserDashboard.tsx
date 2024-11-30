import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/components/ReviewCard";
import { NotificationsTab } from "@/components/admin/NotificationsTab";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { PenLine, Search, Heart, X } from "lucide-react";

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
  const [userData] = useState<UserData>({
    username: localStorage.getItem('username') || "Anonimo",
    email: localStorage.getItem('email') || "",
    registrationNumber: parseInt(localStorage.getItem('registrationNumber') || "0"),
    joinDate: localStorage.getItem('joinDate') || new Date().toISOString()
  });

  const [reviews] = useState<UserReview[]>([]);
  const [comments] = useState<UserComment[]>([]);
  const [notifications] = useState([]);
  const [favoriteConditions, setFavoriteConditions] = useState<string[]>(
    JSON.parse(localStorage.getItem('favoriteConditions') || '[]')
  );

  const handleDeleteReview = (reviewId: string) => {
    toast.success("Recensione eliminata con successo");
  };

  const handleDeleteComment = (commentId: string) => {
    toast.success("Commento eliminato con successo");
  };

  const removeFavorite = (condition: string) => {
    const newFavorites = favoriteConditions.filter(fav => fav !== condition);
    localStorage.setItem('favoriteConditions', JSON.stringify(newFavorites));
    setFavoriteConditions(newFavorites);
    toast.success("Patologia rimossa dai preferiti");
  };

  const markNotificationAsRead = (notificationId: string) => {
    console.log("Marking notification as read:", notificationId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Benvenuto, {userData.username}</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Button asChild size="lg" className="h-24">
          <Link to="/nuova-recensione" className="flex flex-col items-center justify-center space-y-2">
            <PenLine size={24} />
            <span>Racconta la tua Esperienza</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="h-24">
          <Link to="/cerca-patologia" className="flex flex-col items-center justify-center space-y-2">
            <Search size={24} />
            <span>Cerca Patologia</span>
          </Link>
        </Button>
      </div>

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
            <p className="text-gray-600">
              {new Date(userData.joinDate).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="favorites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="favorites">Patologie Preferite</TabsTrigger>
          <TabsTrigger value="reviews">Le tue recensioni</TabsTrigger>
          <TabsTrigger value="comments">I tuoi commenti</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favoriteConditions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteConditions.map((condition) => (
                <Card key={condition} className="p-4">
                  <div className="flex justify-between items-start">
                    <Link 
                      to={`/patologia/${condition}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {condition}
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(condition)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Non hai ancora salvato patologie preferite</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/cerca-patologia">Cerca una patologia</Link>
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
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
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              Non hai ancora scritto recensioni.{" "}
              <Link to="/nuova-recensione" className="text-primary hover:underline">
                Scrivi la tua prima recensione
              </Link>
            </p>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
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
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              Non hai ancora scritto commenti
            </p>
          )}
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