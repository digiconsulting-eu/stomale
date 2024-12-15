import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "@/components/conditions";

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Z'];

const getConditionsByLetter = (letter: string) => {
  switch (letter) {
    case 'A': return CONDITIONS_A;
    case 'B': return CONDITIONS_B;
    case 'C': return CONDITIONS_C;
    case 'D': return CONDITIONS_D;
    case 'E': return CONDITIONS_E;
    case 'F': return CONDITIONS_F;
    case 'G': return CONDITIONS_G;
    case 'H': return CONDITIONS_H;
    case 'I': return CONDITIONS_I;
    case 'L': return CONDITIONS_L;
    case 'M': return CONDITIONS_M;
    case 'N': return CONDITIONS_N;
    case 'O': return CONDITIONS_O;
    case 'P': return CONDITIONS_P;
    case 'R': return CONDITIONS_R;
    case 'S': return CONDITIONS_S;
    case 'T': return CONDITIONS_T;
    case 'U': return CONDITIONS_U;
    case 'V': return CONDITIONS_V;
    case 'Z': return CONDITIONS_Z;
    default: return [];
  }
};

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState('A');

  const { data: conditions, isLoading, error } = useQuery({
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
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3
  });

  if (error) {
    console.error('Error loading conditions:', error);
    toast.error("Errore nel caricamento delle patologie");
  }

  const filteredConditions = conditions?.filter(condition =>
    condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase())
  ) || getConditionsByLetter(selectedLetter).filter(condition =>
    condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Cerca Patologia</h1>
      
      <div className="mb-8">
        <SearchBar
          placeholder="Cerca una patologia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setSelectedLetter(letter)}
            className={`px-4 py-2 rounded-lg ${
              selectedLetter === letter
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
      ) : filteredConditions?.length === 0 ? (
        <p className="text-center text-gray-500">
          {searchTerm ? "Nessuna patologia trovata" : "Nessuna patologia disponibile"}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConditions?.map((condition, index) => (
            <Link 
              key={index}
              to={`/patologia/${typeof condition === 'string' ? condition.toLowerCase() : condition.Patologia.toLowerCase()}`}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="font-semibold mb-2">
                  {typeof condition === 'string' ? condition : condition.Patologia}
                </h2>
                {typeof condition !== 'string' && condition.Descrizione && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {condition.Descrizione}
                  </p>
                )}
                <Badge variant="outline" className="mt-2">
                  Scopri di più
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}