
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "../ReviewActions";
import { ReviewsPagination } from "../../reviews/ReviewsPagination";
import { DatabaseReview } from "@/types/review";
import { ChevronDown, ChevronUp } from "lucide-react";

const ITEMS_PER_PAGE = 50;

interface ReviewsTableProps {
  reviews: DatabaseReview[];
}

export const ReviewsTable = ({ reviews }: ReviewsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recensioni</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Patologia</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((review) => (
            <React.Fragment key={review.id}>
              <TableRow 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleReview(review.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {expandedReviews.includes(review.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {review.title}
                  </div>
                </TableCell>
                <TableCell>{review.PATOLOGIE?.Patologia}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                    {review.status === "approved" ? "Approvata" : "Rimossa"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReviewActions reviewId={review.id} status={review.status} />
                </TableCell>
              </TableRow>
              {expandedReviews.includes(review.id) && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-gray-50">
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
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {reviews.length > ITEMS_PER_PAGE && (
        <div className="mt-4">
          <ReviewsPagination
            currentPage={currentPage}
            totalPages={Math.ceil(reviews.length / ITEMS_PER_PAGE)}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
