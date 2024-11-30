import { ReviewCard } from "@/components/ReviewCard";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useState } from "react";

// Mock data - replace with actual API call later
const MOCK_REVIEWS = Array.from({ length: 45 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Recensione ${i + 1}`,
  condition: ["Emicrania", "Artrite", "Ansia", "Depressione"][Math.floor(Math.random() * 4)],
  preview: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
}));

const Reviews = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 20;
  const totalPages = Math.ceil(MOCK_REVIEWS.length / reviewsPerPage);

  const getCurrentPageReviews = () => {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    return MOCK_REVIEWS.slice(startIndex, endIndex);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Ultime Recensioni</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getCurrentPageReviews().map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Reviews;