
import React, { useState, useEffect } from "react";
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
import { useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 50;

interface ReviewsTableProps {
  reviews: DatabaseReview[];
}

export const ReviewsTable = ({ reviews }: ReviewsTableProps) => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Auto-expand highlighted review from URL
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (!highlightId) return;

    const reviewId = parseInt(highlightId);
    // Ensure the correct page is selected so the row exists
    const index = reviews.findIndex((r) => r.id === reviewId);
    if (index !== -1) {
      const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1;
      if (currentPage !== targetPage) {
        setCurrentPage(targetPage);
      }
      if (!expandedReviews.includes(reviewId)) {
        setExpandedReviews((prev) => [...prev, reviewId]);
      }
    }
  }, [searchParams, reviews]);

// URL params for auto-open edit
const highlightIdParam = searchParams.get('highlight');
const highlightedId = highlightIdParam ? parseInt(highlightIdParam) : null;
const openEdit = searchParams.get('edit') === '1';

// Debugging output
console.log("Reviews data in ReviewsTable:", reviews);
  
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Nessuna recensione trovata.</p>
      </div>
    );
  }

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
                id={`review-${review.id}`}
                className="cursor-pointer hover:bg-gray-50 transition-all"
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
                <TableCell>{review.PATOLOGIE?.Patologia || 'N/D'}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <Badge variant={review.status === "approved" ? "default" : "secondary"}>
                    {review.status === "approved" ? "Approvata" : "Rimossa"}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ReviewActions 
                    reviewId={review.id} 
                    status={review.status}
                    title={review.title}
                    symptoms={review.symptoms}
                    experience={review.experience}
                    patologia={review.patologia || review.PATOLOGIE?.Patologia}
                    autoOpenEdit={openEdit && highlightedId === review.id}
                  />
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
