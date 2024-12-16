import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const LETTERS = ["Tutte", "A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "Z"];

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("Tutte");

  const { data: conditions = [], isLoading, error } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      try {
        console.log('Fetching conditions for search page...');
        const { data, error } = await supabase
          .from('PATOLOGIE')
          .select('*')
          .order('Patologia');

        if (error) {
          console.error('Error fetching conditions:', error);
          throw error;
        }

        if (!data) {
          console.log('No conditions found');
          return [];
        }

        console.log('Successfully fetched conditions:', data.length);
        return data;
      } catch (error) {
        console.error('Error in conditions query:', error);
        if (error.message?.includes('429')) {
          toast.error("Troppe richieste. Per favore, attendi qualche secondo e riprova.");
        } else {
          toast.error("Errore nel caricamento delle patologie");
        }
        return [];
      }
    },
    staleTime: 30000, // Cache data for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const filteredConditions = conditions?.filter(condition => {
    const matchesSearch = searchTerm 
      ? condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesLetter = selectedLetter === "Tutte" 
      ? true 
      : condition.Patologia.startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Cerca una Patologia</h1>
      
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Cerca una patologia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-6 text-lg"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {LETTERS.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "default" : "outline"}
            className="min-w-[40px]"
            onClick={() => setSelectedLetter(letter)}
          >
            {letter}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Si è verificato un errore nel caricamento delle patologie.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mx-auto"
          >
            Riprova
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConditions?.map((condition) => (
            <Card key={condition.id} className="p-6">
              <div className="flex flex-col h-full">
                <h2 className="text-xl font-semibold text-primary mb-2">
                  {condition.Patologia}
                </h2>
                {condition.Descrizione && (
                  <p className="text-gray-600 line-clamp-2 mb-4 flex-grow">
                    {condition.Descrizione}
                  </p>
                )}
                <Link 
                  to={`/patologia/${condition.Patologia.toLowerCase()}`}
                  className="w-full"
                >
                  <Button className="w-full" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Leggi Esperienze
                  </Button>
                </Link>
              </div>
            </Card>
          ))}

          {filteredConditions?.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 mb-4">Nessuna patologia trovata</p>
              <Link 
                to="/inserisci-patologia"
                className="inline-flex items-center text-primary hover:text-primary/80"
              >
                <Plus className="mr-2 h-4 w-4" />
                Clicca qui per aggiungerla
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}