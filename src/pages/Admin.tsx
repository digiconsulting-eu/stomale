import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";

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
      <AdminHeader />
      <AdminTabs
        notifications={notifications}
        reviews={reviews}
        comments={comments}
        admins={admins}
        newAdminEmail={newAdminEmail}
        setNewAdminEmail={setNewAdminEmail}
        handleAddAdmin={handleAddAdmin}
        handleReviewAction={handleReviewAction}
        handleCommentAction={handleCommentAction}
        markNotificationAsRead={markNotificationAsRead}
      />
    </div>
  );
};

export default Admin;