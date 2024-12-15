import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";
import { toast } from "sonner";

const LETTERS = ["Tutte", "A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "Z"];

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("Tutte");

  const { data: conditions, isLoading, error } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      console.log('Fetching conditions...');
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('*')
        .order('Patologia');

      if (error) {
        console.error('Error fetching conditions:', error);
        throw error;
      }

      console.log('Fetched conditions:', data);
      return data;
    },
    meta: {
      errorMessage: "Errore nel caricamento delle patologie"
    }
  });

  // Handle error with toast
  if (error) {
    toast.error("Errore nel caricamento delle patologie");
  }

  const filteredConditions = conditions?.filter(condition => {
    const matchesSearch = condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLetter = selectedLetter === "Tutte" || condition.Patologia.startsWith(selectedLetter);
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

      {/* Alphabetical Index */}
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
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse bg-gray-100" />
          ))}
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
                  <p className="text-gray-600 line-clamp-1 mb-4 flex-grow">
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
        </div>
      )}

      {filteredConditions?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nessuna patologia trovata</p>
        </div>
      )}
    </div>
  );
}