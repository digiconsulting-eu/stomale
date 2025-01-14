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

interface CommentData {
  id: number;
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
  commentsData: CommentData[];
  handleCommentAction: (id: number, action: "approve" | "reject") => void;
}

export const CommentsTab = ({ commentsData, handleCommentAction }: CommentsTabProps) => {
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
          {commentsData.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
              <TableCell>{comment.users?.username}</TableCell>
              <TableCell>{comment.reviews?.title}</TableCell>
              <TableCell>{new Date(comment.created_at).toLocaleDateString('it-IT')}</TableCell>
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