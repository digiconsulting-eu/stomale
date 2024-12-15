import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");

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
  );

  console.log('Filtered conditions:', filteredConditions);

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
          {filteredConditions?.map((condition) => (
            <Link 
              key={condition.id} 
              to={`/patologia/${condition.Patologia.toLowerCase()}`}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="font-semibold mb-2">{condition.Patologia}</h2>
                {condition.Descrizione && (
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