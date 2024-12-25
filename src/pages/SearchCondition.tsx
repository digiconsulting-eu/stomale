import { useState, useEffect } from "react";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle, setMetaDescription, getSearchMetaDescription } from "@/utils/pageTitle";
import { useConditions } from "@/hooks/useConditions";
import { SearchInput } from "@/components/search/SearchInput";
import { LetterFilter } from "@/components/search/LetterFilter";
import { ConditionsGrid } from "@/components/search/ConditionsGrid";

const ITEMS_PER_PAGE = 30;

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("TUTTE");
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    conditions, 
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
        conditions={conditions || []}
        isLoading={isLoading}
      />
    </div>
  );
}