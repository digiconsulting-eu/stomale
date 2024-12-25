import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Accesso negato",
            description: "Devi effettuare l'accesso come amministratore",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            users (username),
            PATOLOGIE (Patologia)
          `)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            users (username),
            reviews (title)
          `)
          .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // Fetch admins
        const { data: adminsData, error: adminsError } = await supabase
          .from('admin')
          .select('*')
          .order('created_at', { ascending: false });

        if (adminsError) throw adminsError;

        // Transform the data to match the expected format
        const formattedReviews = reviewsData.map(review => ({
          id: review.id.toString(),
          title: review.title,
          author: review.users?.username || 'Utente anonimo',
          condition: review.PATOLOGIE?.Patologia || 'N/A',
          status: review.status,
          date: new Date(review.created_at).toISOString().split('T')[0],
        }));

        const formattedComments = commentsData.map(comment => ({
          id: comment.id.toString(),
          content: comment.content,
          author: comment.users?.username || 'Utente anonimo',
          reviewTitle: comment.reviews?.title || 'N/A',
          status: comment.status,
          date: new Date(comment.created_at).toISOString().split('T')[0],
        }));

        const formattedAdmins = adminsData.map(admin => ({
          id: admin.id.toString(),
          email: admin.email,
          dateAdded: new Date(admin.created_at).toISOString().split('T')[0],
        }));

        setReviews(formattedReviews);
        setComments(formattedComments);
        setAdmins(formattedAdmins);
        setIsAdmin(true);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: "Errore",
          description: "Si è verificato un errore nel caricamento dei dati",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const handleReviewAction = async (id: string, action: "approve" | "reject") => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;

      setReviews(reviews.map(review => 
        review.id === id ? { ...review, status: action } : review
      ));
      
      toast({
        title: action === "approve" ? "Recensione approvata" : "Recensione rifiutata",
        description: `La recensione è stata ${action === "approve" ? "approvata" : "rifiutata"} con successo.`,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiornamento della recensione",
        variant: "destructive",
      });
    }
  };

  const handleCommentAction = async (id: string, action: "approve" | "reject") => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: action })
        .eq('id', id);

      if (error) throw error;

      setComments(comments.map(comment => 
        comment.id === id ? { ...comment, status: action } : comment
      ));
      
      toast({
        title: action === "approve" ? "Commento approvato" : "Commento rifiutato",
        description: `Il commento è stato ${action === "approve" ? "approvato" : "rifiutato"} con successo.`,
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiornamento del commento",
        variant: "destructive",
      });
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo email valido",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin')
        .insert([{ email: newAdminEmail }])
        .select()
        .single();

      if (error) throw error;

      const newAdmin = {
        id: data.id.toString(),
        email: data.email,
        dateAdded: new Date(data.created_at).toISOString().split('T')[0],
      };

      setAdmins([...admins, newAdmin]);
      setNewAdminEmail("");
      
      toast({
        title: "Amministratore aggiunto",
        description: "Il nuovo amministratore è stato aggiunto con successo.",
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiunta dell'amministratore",
        variant: "destructive",
      });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="text-xl">Caricamento...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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