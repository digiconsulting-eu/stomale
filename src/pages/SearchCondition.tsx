
import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 30;

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("TUTTE");
  const [currentPage, setCurrentPage] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(0);

  const handleManualRefresh = useCallback(() => {
    console.log("Manually refreshing conditions");
    setForceRefresh(prev => prev + 1);
  }, []);

  const { 
    data,
    isLoading,
    error,
    refetch 
  } = useConditions({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    searchTerm,
    letter: searchTerm ? "" : selectedLetter,
    forceRefresh
  });

  // Force refetch on mount
  useEffect(() => {
    console.log('SearchCondition component mounted, forcing refetch');
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for auth state changes and refetch when user logs in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed in SearchCondition:", event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Refreshing conditions after auth change");
        setTimeout(() => {
          refetch();
        }, 500);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

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

  // Log data when it changes
  useEffect(() => {
    console.log('Data from useConditions:', data);
  }, [data]);

  const handleLetterSelect = (letter: string) => {
    console.log('Letter selected:', letter);
    setSelectedLetter(letter);
    setSearchTerm("");
  };

  const handleSearch = (term: string) => {
    console.log('Search term:', term);
    setSearchTerm(term);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cerca Patologia</h1>
      
      <SearchInput 
        value={searchTerm}
        onChange={handleSearch}
      />

      <LetterFilter 
        selectedLetter={selectedLetter}
        onLetterSelect={handleLetterSelect}
      />

      <ConditionsGrid 
        conditions={data?.conditions || []}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="text-center mt-8">
          <p className="text-red-500 mb-4">Errore nel caricamento delle patologie</p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Riprova
          </button>
        </div>
      ) : data?.conditions?.length === 0 ? (
        <div className="text-center mt-8">
          <p className="text-gray-500 mb-4">Nessuna patologia trovata</p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Ricarica patologie
          </button>
        </div>
      ) : data?.totalPages > 1 ? (
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
              
              {[...Array(data.totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === data.totalPages ||
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
                  (pageNumber === currentPage + 3 && pageNumber < data.totalPages - 1)
                ) {
                  return <PaginationItem key={pageNumber}>...</PaginationItem>;
                }
                return null;
              })}

              {currentPage < data.totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(data.totalPages, prev + 1))}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}
    </div>
  );
}
