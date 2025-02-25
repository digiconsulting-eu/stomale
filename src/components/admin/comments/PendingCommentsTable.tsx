
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
  const { data: pendingComments, refetch: refetchComments, isError, error: queryError } = useQuery({
    queryKey: ['pending-comments'],
    queryFn: async () => {
      console.log('Starting to fetch pending comments...');
      
      // First check if there are any comments at all
      const { data: allComments, error: countError } = await supabase
        .from('comments')
        .select('*');
        
      if (countError) {
        console.error('Error checking comments:', countError);
        throw countError;
      }
      
      console.log('All comments in database:', allComments);

      // Then get pending comments without any filters first
      const { data: allPendingComments, error: pendingError } = await supabase
        .from('comments')
        .select(`
          *,
          users (
            username,
            email
          )
        `);

      if (pendingError) {
        console.error('Error fetching all comments:', pendingError);
        throw pendingError;
      }

      console.log('All comments before status filter:', allPendingComments);

      // Now get only pending comments
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          review_id,
          status,
          users (
            username,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending comments:', error);
        throw error;
      }

      console.log('Final pending comments query result:', {
        commentCount: data?.length || 0,
        comments: data
      });
      
      return data;
    },
    meta: {
      onError: (error: Error) => {
        console.error('Query error in PendingCommentsTable:', error);
        toast.error('Errore nel caricamento dei commenti');
      }
    }
  });

  const handleApproveComment = async (commentId: number) => {
    try {
      console.log('Approving comment:', commentId);
      const { error } = await supabase
        .from('comments')
        .update({ status: 'approved' })
        .eq('id', commentId);

      if (error) throw error;

      console.log('Comment approved successfully');
      toast.success('Commento approvato con successo');
      refetchComments();
    } catch (error) {
      console.error('Error approving comment:', error);
      toast.error('Errore durante l\'approvazione del commento');
    }
  };

  const handleRejectComment = async (commentId: number) => {
    try {
      console.log('Rejecting comment:', commentId);
      const { error } = await supabase
        .from('comments')
        .update({ status: 'rejected' })
        .eq('id', commentId);

      if (error) throw error;

      console.log('Comment rejected successfully');
      toast.success('Commento rifiutato');
      refetchComments();
    } catch (error) {
      console.error('Error rejecting comment:', error);
      toast.error('Errore durante il rifiuto del commento');
    }
  };

  if (isError) {
    console.error('Error in PendingCommentsTable:', queryError);
    return (
      <div className="p-4 text-red-500">
        Errore nel caricamento dei commenti. Per favore, riprova più tardi.
      </div>
    );
  }

  // Show loading state
  if (!pendingComments) {
    return (
      <div className="p-4">
        Caricamento commenti in corso...
      </div>
    );
  }

  // Show empty state
  if (pendingComments.length === 0) {
    console.log('No pending comments found');
    return (
      <div className="p-4 text-gray-500">
        Non ci sono commenti in attesa di approvazione.
      </div>
    );
  }

  console.log('Rendering pending comments table with:', pendingComments);
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
              <TableCell>{comment.users?.username || comment.users?.email || 'Utente anonimo'}</TableCell>
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
