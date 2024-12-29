import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface ReviewsPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const ReviewsPagination = ({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: ReviewsPaginationProps) => {
  // Function to get visible page numbers
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        i >= currentPage - delta && 
        i <= currentPage + delta
      ) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="flex justify-center my-8">
      <Pagination>
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : ''} bg-white hover:bg-gray-50`}
            >
              Precedente
            </PaginationPrevious>
          </PaginationItem>
          
          {getVisiblePages().map((pageNum, i) => (
            <PaginationItem key={i}>
              {pageNum === '...' ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink
                  onClick={() => setCurrentPage(Number(pageNum))}
                  isActive={currentPage === pageNum}
                  className={`${
                    currentPage === pageNum 
                      ? 'bg-primary text-white hover:bg-primary-hover' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} bg-white hover:bg-gray-50`}
            >
              Successiva
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};