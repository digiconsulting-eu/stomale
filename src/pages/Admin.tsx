import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const MOCK_REVIEWS = [
  {
    id: "1",
    title: "La mia esperienza con l'emicrania cronica",
    author: "Mario Rossi",
    condition: "Emicrania",
    status: "pending",
    date: "2024-02-20",
  },
  {
    id: "2",
    title: "Gestire l'artrite reumatoide",
    author: "Laura Bianchi",
    condition: "Artrite Reumatoide",
    status: "approved",
    date: "2024-02-19",
  },
];

const MOCK_COMMENTS = [
  {
    id: "1",
    content: "Grazie per aver condiviso la tua esperienza...",
    author: "Giuseppe Verdi",
    reviewTitle: "La mia esperienza con l'emicrania cronica",
    status: "pending",
    date: "2024-02-21",
  },
];

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [comments, setComments] = useState(MOCK_COMMENTS);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  const handleReviewAction = (id: string, action: "approve" | "reject") => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, status: action === "approve" ? "approved" : "rejected" } : review
    ));
    
    toast({
      title: action === "approve" ? "Recensione approvata" : "Recensione rifiutata",
      description: `La recensione è stata ${action === "approve" ? "approvata" : "rifiutata"} con successo.`,
    });
  };

  const handleCommentAction = (id: string, action: "approve" | "reject") => {
    setComments(comments.map(comment => 
      comment.id === id ? { ...comment, status: action === "approve" ? "approved" : "rejected" } : comment
    ));
    
    toast({
      title: action === "approve" ? "Commento approvato" : "Commento rifiutato",
      description: `Il commento è stato ${action === "approve" ? "approvato" : "rifiutato"} con successo.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Area Amministrazione</h1>
      
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList>
          <TabsTrigger value="reviews">Recensioni</TabsTrigger>
          <TabsTrigger value="comments">Commenti</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Autore</TableHead>
                  <TableHead>Patologia</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.title}</TableCell>
                    <TableCell>{review.author}</TableCell>
                    <TableCell>{review.condition}</TableCell>
                    <TableCell>{review.date}</TableCell>
                    <TableCell>
                      <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                        {review.status === "approved" ? "Approvata" : "In attesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewAction(review.id, "approve")}
                          disabled={review.status === "approved"}
                        >
                          Approva
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReviewAction(review.id, "reject")}
                          disabled={review.status === "rejected"}
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
        </TabsContent>

        <TabsContent value="comments">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;