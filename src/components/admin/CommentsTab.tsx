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

interface Comment {
  id: string;
  content: string;
  author: string;
  reviewTitle: string;
  status: string;
  date: string;
}

interface CommentsTabProps {
  comments: Comment[];
  handleCommentAction: (id: string, action: "approve" | "reject") => void;
}

export const CommentsTab = ({ comments, handleCommentAction }: CommentsTabProps) => {
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
          {comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="max-w-xs truncate">{comment.content}</TableCell>
              <TableCell>{comment.author}</TableCell>
              <TableCell>{comment.reviewTitle}</TableCell>
              <TableCell>{comment.date}</TableCell>
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