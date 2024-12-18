import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen } from "lucide-react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");

  const { data: conditions, isLoading } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      try {
        console.log('Fetching conditions...');
        const { data, error } = await supabase
          .from('PATOLOGIE')
          .select('*')
          .order('Patologia');

        if (error) {
          console.error('Error fetching conditions:', error);
          throw error;
        }

        console.log('Successfully fetched conditions:', data?.length || 0);
        return data;
      } catch (error) {
        console.error('Error in conditions query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const filteredConditions = conditions?.filter(condition => {
    const matchesSearch = condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = !selectedLetter || condition.Patologia.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-4 sm:mb-6">
          Cerca una Patologia
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-4 sm:mb-6">
        Cerca una Patologia
      </h1>
      
      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
        <Input
          type="text"
          placeholder="Cerca una patologia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 sm:pl-10 py-2 sm:py-4 text-sm sm:text-base"
        />
      </div>

      <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4 sm:mb-6">
        {LETTERS.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "outline"}
            className="min-w-[24px] sm:min-w-[32px] h-6 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm"
            onClick={() => setSelectedLetter(letter === selectedLetter ? "" : letter)}
          >
            {letter}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {filteredConditions?.map((condition) => (
          <Card key={condition.id} className="p-2 sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-primary truncate">
                {condition.Patologia}
              </h2>
              <Link 
                to={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
                className="shrink-0"
              >
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white h-7 w-7 sm:h-8 sm:w-8 p-0"
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {filteredConditions?.length === 0 && (
          <div className="col-span-full text-center py-4 sm:py-6">
            <p className="text-gray-500 text-sm sm:text-base mb-2 sm:mb-3">
              Nessuna patologia trovata
            </p>
            <Link 
              to="/inserisci-patologia"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm sm:text-base"
            >
              Vuoi aggiungere una nuova patologia?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}