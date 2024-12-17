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

  const { data: conditions = [], isLoading, isError } = useQuery({
    queryKey: ['searchConditions'],
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

        console.log('Successfully fetched conditions:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error in conditions query:', error);
        throw error;
      }
    }
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

  if (isError) {
    toast.error("Errore nel caricamento delle patologie");
  }

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
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConditions?.map((condition) => (
            <Card key={condition.id} className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-primary truncate mr-4">
                  {condition.Patologia}
                </h2>
                <Link 
                  to={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
                  className="shrink-0"
                >
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary-hover text-white px-3 py-1 h-8"
                  >
                    <BookOpen className="h-4 w-4" />
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
