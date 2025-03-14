
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DatabaseComment } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { EmptyComments } from "./EmptyComments";
import { CommentItem } from "./CommentItem";

export const PendingCommentsTable = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: comments, isLoading, isError, refetch } = useQuery({
    queryKey: ["pending-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, users(username)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include username field
      return data.map((comment) => ({
        ...comment,
        username: comment.users?.username || "Utente anonimo",
      })) as DatabaseComment[];
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Errore nel caricamento dei commenti");
    }
  }, [isError]);

  const handleApproveComment = async (id: number) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Commento approvato con successo");
      refetch();
    } catch (error) {
      console.error("Error approving comment:", error);
      toast.error("Errore nell'approvazione del commento");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectComment = async (id: number) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Commento rifiutato con successo");
      refetch();
    } catch (error) {
      console.error("Error rejecting comment:", error);
      toast.error("Errore nel rifiuto del commento");
    } finally {
      setIsUpdating(false);
    }
  };

  const isPending = comments && comments.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Commenti in attesa di moderazione</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center p-4">Caricamento commenti...</div>
      ) : !isPending ? (
        <EmptyComments />
      ) : (
        <div className="space-y-2">
          {comments?.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onApprove={handleApproveComment}
              onReject={handleRejectComment}
              isLoading={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
};
