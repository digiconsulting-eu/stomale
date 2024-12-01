import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { NotificationsTab } from "@/components/admin/NotificationsTab";
import { ReviewsTab } from "@/components/admin/ReviewsTab";
import { CommentsTab } from "@/components/admin/CommentsTab";
import { AdminsTab } from "@/components/admin/AdminsTab";
import ImportTab from "@/components/admin/ImportTab";
import { Link } from "react-router-dom";
import { Users, ClipboardList } from "lucide-react";

// Temporary mock data
const MOCK_REVIEWS = [
  {
    id: "1",
    title: "La mia esperienza con l'emicrania cronica",
    author: "Mario Rossi",
    condition: "Emicrania",
    status: "pending",
    date: "2024-02-20",
  },
  {
    id: "2",
    title: "Gestire l'artrite reumatoide",
    author: "Laura Bianchi",
    condition: "Artrite Reumatoide",
    status: "approved",
    date: "2024-02-19",
  },
];

const MOCK_COMMENTS = [
  {
    id: "1",
    content: "Grazie per aver condiviso la tua esperienza...",
    author: "Giuseppe Verdi",
    reviewTitle: "La mia esperienza con l'emicrania cronica",
    status: "pending",
    date: "2024-02-21",
  },
];

const MOCK_ADMINS = [
  {
    id: "1",
    email: "franca.castelli@jobreference.it",
    dateAdded: "2024-02-01",
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "review",
    title: "Nuova recensione",
    content: "Mario Rossi ha pubblicato una nuova recensione",
    date: "2024-02-20",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    title: "Nuovo commento",
    content: "Giuseppe Verdi ha commentato una recensione",
    date: "2024-02-21",
    read: false,
  },
];

const Admin = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [admins, setAdmins] = useState(MOCK_ADMINS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const handleReviewAction = (id: string, action: "approve" | "reject") => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: action === "approve" ? "approved" : "rejected" } : review
    ));
    
    toast({
      title: action === "approve" ? "Recensione approvata" : "Recensione rifiutata",
      description: `La recensione è stata ${action === "approve" ? "approvata" : "rifiutata"} con successo.`,
    });
  };

  const handleCommentAction = (id: string, action: "approve" | "reject") => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: action === "approve" ? "approved" : "rejected" } : comment
    ));
    
    toast({
      title: action === "approve" ? "Commento approvato" : "Commento rifiutato",
      description: `Il commento è stato ${action === "approve" ? "approvato" : "rifiutato"} con successo.`,
    });
  };

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive",
      });
      return;
    }

    const newAdmin = {
      id: (admins.length + 1).toString(),
      email: newAdminEmail,
      dateAdded: new Date().toISOString().split("T")[0],
    };

    setAdmins([...admins, newAdmin]);
    setNewAdminEmail("");
    
    toast({
      title: "Amministratore aggiunto",
      description: "Il nuovo amministratore è stato aggiunto con successo.",
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Area Amministrazione</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="gap-2">
            <Link to="/admin/recensioni">
              <ClipboardList className="h-4 w-4" />
              Gestione Recensioni
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin/utenti">
              <Users className="h-4 w-4" />
              Gestione Utenti
            </Link>
          </Button>
        </div>
      </div>
      
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
    </div>
  );
};

export default Admin;
