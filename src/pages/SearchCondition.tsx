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

interface Condition {
  id: number;
  Patologia: string;
  Descrizione: string | null;
}

const LETTERS = ["Tutte", "A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "Z"];

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("Tutte");

  const { data: conditions = [], isLoading, error } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      console.log('Starting to fetch conditions from PATOLOGIE table...');
      
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('*')
        .order('Patologia');

      if (error) {
        console.error('Error fetching conditions:', error);
        throw error;
      }

      console.log('Successfully fetched conditions:', data);
      return data || [];
    },
    retry: 3,
    retryDelay: 1000
  });

  if (error) {
    console.error('Query error:', error);
    toast.error("Errore nel caricamento delle patologie. Riprova più tardi.");
  }

  const filteredConditions = conditions.filter(condition => {
    const matchesSearch = searchTerm 
      ? condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesLetter = selectedLetter === "Tutte" 
      ? true 
      : condition.Patologia.startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Cerca una Patologia</h1>
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Cerca una patologia..."
            className="pl-10 py-6 text-lg"
            disabled
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {LETTERS.map((letter) => (
            <Skeleton key={letter} className="h-10 w-10" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredConditions.map((condition) => (
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
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Leggi Esperienza
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredConditions.length === 0 && (
        <div className="text-center py-8">
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
  );
}