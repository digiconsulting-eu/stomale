import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReviewActions } from "./ReviewActions";
import { ReviewsPagination } from "../reviews/ReviewsPagination";
import { useState } from "react";
import { DatabaseReview } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 50;

interface ReviewManagementTableProps {
  reviews: DatabaseReview[];
  isLoading: boolean;
}

export const ReviewManagementTable = ({ reviews, isLoading }: ReviewManagementTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Aggiungiamo la query per i commenti in attesa
  const { data: pendingComments } = useQuery({
    queryKey: ['pending-comments'],
    queryFn: async () => {
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

      return data;
    }
  });

  const handleApproveComment = async (commentId: number) => {
    const { error } = await supabase
      .from('comments')
      .update({ status: 'approved' })
      .eq('id', commentId);

    if (error) {
      console.error('Error approving comment:', error);
      return;
    }
  };

  const handleRejectComment = async (commentId: number) => {
    const { error } = await supabase
      .from('comments')
      .update({ status: 'rejected' })
      .eq('id', commentId);

    if (error) {
      console.error('Error rejecting comment:', error);
      return;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  // Mostriamo prima i commenti in attesa
  if (pendingComments && pendingComments.length > 0) {
    return (
      <div className="space-y-8">
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

        <div className="border-t pt-8">
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
