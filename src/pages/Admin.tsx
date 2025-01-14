import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const Admin = () => {
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('condition_updates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          status,
          users (
            username
          ),
          reviews (
            title
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: admins = [] } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleReviewAction = async (id: number, action: "approve" | "reject") => {
    const { error } = await supabase
      .from('reviews')
      .update({ status: action === "approve" ? "approved" : "rejected" })
      .eq('id', id);

    if (error) {
      toast.error("Errore durante l'aggiornamento della recensione");
      return;
    }

    toast.success(`Recensione ${action === "approve" ? "approvata" : "rifiutata"} con successo`);
    refetchReviews();
  };

  const handleCommentAction = async (id: number, action: "approve" | "reject") => {
    const { error } = await supabase
      .from('comments')
      .update({ status: action === "approve" ? "approved" : "rejected" })
      .eq('id', id);

    if (error) {
      toast.error("Errore durante l'aggiornamento del commento");
      return;
    }

    toast.success(`Commento ${action === "approve" ? "approvato" : "rifiutato"} con successo`);
    refetchComments();
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Inserisci un'email valida");
      return;
    }

    const { error } = await supabase
      .from('admin')
      .insert([{ email: newAdminEmail }]);

    if (error) {
      toast.error("Errore durante l'aggiunta dell'amministratore");
      return;
    }

    toast.success("Amministratore aggiunto con successo");
    setNewAdminEmail("");
  };

  const markNotificationAsRead = async (id: number) => {
    const { error } = await supabase
      .from('condition_updates')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      toast.error("Errore durante l'aggiornamento della notifica");
      return;
    }

    toast.success("Notifica contrassegnata come letta");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <div className="mt-8">
        <AdminTabs
          notifications={notifications}
          reviews={reviews}
          commentsData={comments}
          admins={admins}
          newAdminEmail={newAdminEmail}
          setNewAdminEmail={setNewAdminEmail}
          handleAddAdmin={handleAddAdmin}
          handleReviewAction={handleReviewAction}
          handleCommentAction={handleCommentAction}
          markNotificationAsRead={markNotificationAsRead}
        />
      </div>
    </div>
  );
};

export default Admin;