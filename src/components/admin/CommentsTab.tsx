import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  status: string;
  users: {
    username: string;
  };
  reviews: {
    title: string;
  };
}

interface CommentsTabProps {
  handleCommentAction: (id: string, action: "approve" | "reject") => void;
}

export const CommentsTab = ({ handleCommentAction }: CommentsTabProps) => {
  const { data: comments, isLoading } = useQuery({
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    }
  });

  if (isLoading) {
    return <div>Caricamento commenti...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contenuto</TableHead>
            <TableHead>Autore</TableHead>
            <TableHead>Recensione</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments?.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
              <TableCell>{comment.users?.username}</TableCell>
              <TableCell>{comment.reviews?.title}</TableCell>
              <TableCell>{format(new Date(comment.created_at), 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                <Badge variant={comment.status === "approved" ? "default" : "secondary"}>
                  {comment.status === "approved" ? "Approvato" : "In attesa"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCommentAction(comment.id, "approve")}
                    disabled={comment.status === "approved"}
                  >
                    Approva
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCommentAction(comment.id, "reject")}
                    disabled={comment.status === "rejected"}
                  >
                    Rifiuta
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};