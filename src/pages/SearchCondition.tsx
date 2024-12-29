import { useState, useEffect } from "react";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle, setMetaDescription, getSearchMetaDescription } from "@/utils/pageTitle";
import { useConditions } from "@/hooks/useConditions";
import { SearchInput } from "@/components/search/SearchInput";
import { LetterFilter } from "@/components/search/LetterFilter";
import { ConditionsGrid } from "@/components/search/ConditionsGrid";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 30;

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("TUTTE");
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    conditions, 
    totalPages,
    isLoading,
    error 
  } = useConditions({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    searchTerm,
    letter: searchTerm ? "TUTTE" : selectedLetter
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Cerca Patologia"));
    setMetaDescription(getSearchMetaDescription());
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Error fetching conditions:', error);
      toast.error("Errore nel caricamento delle patologie");
    }
  }, [error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLetter]);

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
    setSearchTerm("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cerca Patologia</h1>
      
      <SearchInput 
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <LetterFilter 
        selectedLetter={selectedLetter}
        onLetterSelect={handleLetterSelect}
      />

      <ConditionsGrid 
        conditions={conditions}
        isLoading={isLoading}
      />

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  />
                </PaginationItem>
              )}
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                if (
                  (pageNumber === currentPage - 3 && pageNumber > 2) ||
                  (pageNumber === currentPage + 3 && pageNumber < totalPages - 1)
                ) {
                  return <PaginationItem key={pageNumber}>...</PaginationItem>;
                }
                return null;
              })}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}