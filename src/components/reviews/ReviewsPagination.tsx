import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReviewsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ReviewsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: ReviewsPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} cursor-pointer`}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNumber = i + 1;
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  onClick={() => onPageChange(pageNumber)}
                  isActive={currentPage === pageNumber}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} cursor-pointer`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};