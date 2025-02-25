
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
  status: string;
  users?: {
    username: string;
    email: string;
  };
}

export const PendingCommentsTable = () => {
  const { data: allComments, refetch: refetchComments, isError, error: queryError } = useQuery({
    queryKey: ['all-comments'],
    queryFn: async () => {
      console.log('Starting to fetch all comments...');
      
      // Fetch ALL comments to see what's in the database
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          status,
          users (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('All comments from database:', data);
      
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
  if (!allComments) {
    return (
      <div className="p-4">
        Caricamento commenti in corso...
      </div>
    );
  }

  // Filter pending comments
  const pendingComments = allComments.filter(comment => comment.status === 'pending');

  // Debug information
  console.log('All comments:', allComments);
  console.log('Pending comments:', pendingComments);
  console.log('Comments by status:', allComments.reduce((acc, comment) => {
    acc[comment.status] = (acc[comment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));

  // Show empty state for pending comments
  if (pendingComments.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Stato dei Commenti</h2>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">
            Non ci sono commenti in attesa di approvazione.
          </p>
          <div className="text-sm text-gray-600">
            <p>Statistiche commenti:</p>
            <ul className="list-disc pl-5 mt-2">
              {Object.entries(allComments.reduce((acc, comment) => {
                acc[comment.status] = (acc[comment.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([status, count]) => (
                <li key={status}>
                  {status}: {count} commenti
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
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
