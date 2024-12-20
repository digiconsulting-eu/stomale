import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

const LETTERS = ["TUTTE", ...("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))];

interface Condition {
  id: number;
  Patologia: string;
  Descrizione?: string;
}

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("TUTTE");

  const { data: conditions = [], isLoading, error } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      try {
        console.log('Starting conditions fetch...');
        const { data, error } = await supabase
          .from('PATOLOGIE')
          .select('id, Patologia, Descrizione')
          .order('Patologia');

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Raw Supabase response:', data);
        
        if (!data) {
          console.log('No data returned from query');
          return [];
        }

        // Log the first few items to verify data structure
        console.log('First few conditions:', data.slice(0, 3));
        console.log('Total conditions fetched:', data.length);
        
        return data as Condition[];
      } catch (error) {
        console.error('Query error:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Cerca Patologia"));
  }, []);

  if (error) {
    console.error('Error in conditions query:', error);
    toast.error("Errore nel caricamento delle patologie");
  }

  const filteredConditions = conditions.filter((condition: Condition) => {
    if (!condition?.Patologia) {
      console.warn('Invalid condition object:', condition);
      return false;
    }
    
    const conditionName = condition.Patologia.toUpperCase();
    const searchTermUpper = searchTerm.toUpperCase();
    
    if (searchTerm) {
      return conditionName.includes(searchTermUpper);
    }
    
    if (selectedLetter === "TUTTE") {
      return true;
    }
    
    return conditionName.startsWith(selectedLetter);
  });

  console.log('Total conditions:', conditions.length);
  console.log('Filtered conditions:', filteredConditions.length);
  console.log('Current filter:', { searchTerm, selectedLetter });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">
        Cerca una Patologia
      </h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Cerca una patologia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-4 md:py-6 text-base md:text-lg"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8">
        {LETTERS.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "outline"}
            className="min-w-[32px] md:min-w-[40px] h-8 md:h-10 px-2 text-sm md:text-base"
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[80px] md:h-[100px]" />
          ))}
        </div>
      ) : filteredConditions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredConditions.map((condition: Condition) => (
            <Card key={condition.id} className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base md:text-lg font-semibold text-primary truncate">
                  {condition.Patologia}
                </h2>
                <Link 
                  to={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
                  className="shrink-0"
                >
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary-hover text-white h-8 w-8 p-0"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 md:py-8">
          <p className="text-gray-500 mb-3 md:mb-4">Nessuna patologia trovata</p>
          <Link 
            to="/inserisci-patologia"
            className="inline-flex items-center text-primary hover:text-primary/80"
          >
            Vuoi aggiungere una nuova patologia?
          </Link>
        </div>
      )}
    </div>
  );
}