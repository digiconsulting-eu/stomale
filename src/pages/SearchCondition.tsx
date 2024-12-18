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

  const { data: conditions = [], isLoading, error } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
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
    },
  });

  if (error) {
    console.error('Error in conditions query:', error);
  }

  const filteredConditions = conditions.filter(condition => {
    if (!condition?.Patologia) return false;
    
    const matchesSearch = searchTerm 
      ? condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
      
    const matchesLetter = selectedLetter 
      ? condition.Patologia.startsWith(selectedLetter)
      : true;
      
    return matchesSearch && matchesLetter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">
          Cerca una Patologia
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6">
        Cerca una Patologia
      </h1>
      
      <div className="relative mb-6">
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
            className="min-w-[40px] h-10"
            onClick={() => setSelectedLetter(selectedLetter === letter ? "" : letter)}
          >
            {letter}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConditions.map((condition) => (
          <Card key={condition.id} className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-primary truncate">
                {condition.Patologia}
              </h2>
              <Link 
                to={`/patologia/${encodeURIComponent(condition.Patologia.toLowerCase())}`}
                className="shrink-0"
              >
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white h-8 w-8 p-0"
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}

        {filteredConditions.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500 mb-4">Nessuna patologia trovata</p>
            <Link 
              to="/inserisci-patologia"
              className="text-primary hover:text-primary/80"
            >
              Vuoi aggiungere una nuova patologia?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}