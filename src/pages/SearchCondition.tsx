import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";
import { Link } from "react-router-dom";
import { useConditions } from "@/hooks/useConditions";
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

  const letters = ["TUTTE", "A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", 
                  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "Z"];

  const { 
    conditions, 
    totalPages,
    isLoading,
    error 
  } = useConditions({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    searchTerm,
    letter: selectedLetter
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Cerca Patologia"));
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Error fetching conditions:', error);
      toast.error("Errore nel caricamento delle patologie");
    }
  }, [error]);

  // Reset alla prima pagina quando cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLetter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cerca Patologia</h1>
      
      <div className="mb-8">
        <Input
          placeholder="Cerca una patologia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-5xl mx-auto h-14 text-lg px-6"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {letters.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "outline"}
            onClick={() => {
              setSelectedLetter(letter);
              setSearchTerm("");
            }}
            className="min-w-[40px]"
          >
            {letter}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditions.map(condition => (
              <Link 
                key={condition.id}
                to={`/patologia/${condition.Patologia.toLowerCase()}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white group"
              >
                <h2 className="text-xl font-semibold text-[#0EA5E9] group-hover:text-[#0EA5E9]/80 transition-colors">
                  {condition.Patologia}
                </h2>
              </Link>
            ))}
            {conditions.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Nessuna patologia trovata.</p>
              </div>
            )}
          </div>

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
                    // Mostra solo le pagine vicine a quella corrente
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
                    // Mostra i puntini di sospensione
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
        </>
      )}
    </div>
  );
}