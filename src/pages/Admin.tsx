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
      return data;
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
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
      return data;
    }
  });

  const handleAddAdmin = async () => {
    const { error } = await supabase
      .from('admin')
      .insert([{ email: newAdminEmail }]);

    if (error) {
      toast.error("Errore nell'aggiunta dell'amministratore");
      return;
    }

    toast.success("Amministratore aggiunto con successo");
    setNewAdminEmail("");
  };

  const handleReviewAction = async (id: number, action: "approve" | "reject") => {
    const { error } = await supabase
      .from('reviews')
      .update({ status: action })
      .eq('id', id);

    if (error) {
      toast.error("Errore nell'aggiornamento della recensione");
      return;
    }

    toast.success("Recensione aggiornata con successo");
  };

  const handleCommentAction = async (id: string, action: "approve" | "reject") => {
    const { error } = await supabase
      .from('comments')
      .update({ status: action })
      .eq('id', id);

    if (error) {
      toast.error("Errore nell'aggiornamento del commento");
      return;
    }

    toast.success("Commento aggiornato con successo");
  };

  const markNotificationAsRead = async (id: string) => {
    const { error } = await supabase
      .from('condition_updates')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Errore nella gestione della notifica");
      return;
    }

    toast.success("Notifica rimossa con successo");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader />
      <div className="mt-8">
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
    </div>
  );
};

export default Admin;