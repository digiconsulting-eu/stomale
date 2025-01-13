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
import { DatabaseReview } from "@/types/review";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReviewsTabProps {
  reviews: DatabaseReview[];
  handleReviewAction: (id: number, action: "approve" | "reject") => void;
}

export const ReviewsTab = ({ reviews, handleReviewAction }: ReviewsTabProps) => {
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  return (
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
            <>
              <TableRow key={review.id} className="cursor-pointer hover:bg-gray-50" onClick={() => toggleReview(review.id)}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {expandedReviews.includes(review.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {review.title}
                  </div>
                </TableCell>
                <TableCell>{review.username || 'Anonimo'}</TableCell>
                <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                    {review.status === "approved" ? "Approvata" : "In attesa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {review.status !== "approved" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReviewAction(review.id, "approve");
                        }}
                      >
                        Approva
                      </Button>
                    )}
                    {review.status !== "removed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReviewAction(review.id, "reject");
                        }}
                      >
                        Rimuovi
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
              {expandedReviews.includes(review.id) && (
                <TableRow>
                  <TableCell colSpan={6} className="bg-gray-50">
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Sintomi:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{review.symptoms}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Esperienza:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{review.experience}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};