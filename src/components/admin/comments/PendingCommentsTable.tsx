
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseComment } from "@/types/comment";
import { toast } from "sonner";
import { EmptyComments } from "./EmptyComments";
import { CommentItem } from "./CommentItem";

export const PendingCommentsTable = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: comments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pending-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          users (
            id,
            username,
            email
          ),
          reviews (
            id, 
            title
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DatabaseComment[];
    },
  });

  useEffect(() => {
    const subscription = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: "status=eq.pending",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [refetch]);

  const handleApproveComment = async (commentId: number) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: "approved" })
        .eq("id", commentId);

      if (error) throw error;
      toast.success("Commento approvato con successo");
      refetch();
    } catch (error) {
      console.error("Error approving comment:", error);
      toast.error("Errore nell'approvazione del commento");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectComment = async (commentId: number) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status: "rejected" })
        .eq("id", commentId);

      if (error) throw error;
      toast.success("Commento rifiutato con successo");
      refetch();
    } catch (error) {
      console.error("Error rejecting comment:", error);
      toast.error("Errore nel rifiuto del commento");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full p-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  if (!comments || comments.length === 0) {
    return <EmptyComments />;
  }

  return (
    <Card className="w-full">
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex flex-col">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id}
              comment={comment}
              onApprove={handleApproveComment}
              onReject={handleRejectComment}
              isLoading={isProcessing}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
