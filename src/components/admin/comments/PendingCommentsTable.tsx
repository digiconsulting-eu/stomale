
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  users?: {
    username: string;
  };
}

export const PendingCommentsTable = () => {
  const { data: pendingComments, refetch: refetchComments } = useQuery({
    queryKey: ['pending-comments'],
    queryFn: async () => {
      console.log('Fetching pending comments...');
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          review_id,
          users (
            username
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending comments:', error);
        throw error;
      }

      console.log('Fetched pending comments:', data);
      return data;
    }
  });

  const handleApproveComment = async (commentId: number) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Commento approvato con successo');
      refetchComments();
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error('Errore durante l\'approvazione del commento');
    }
  };

  const handleRejectComment = async (commentId: number) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Commento rifiutato');
      refetchComments();
    } catch (error) {
      console.error('Error rejecting comment:', error);
      toast.error('Errore durante il rifiuto del commento');
    }
  };

  if (!pendingComments?.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Commenti in Attesa di Approvazione</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Autore</TableHead>
            <TableHead>Contenuto</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingComments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>{comment.users?.username}</TableCell>
              <TableCell className="max-w-md truncate">{comment.content}</TableCell>
              <TableCell>
                {new Date(comment.created_at).toLocaleDateString('it-IT')}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveComment(comment.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approva
                  </button>
                  <button
                    onClick={() => handleRejectComment(comment.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Rifiuta
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
