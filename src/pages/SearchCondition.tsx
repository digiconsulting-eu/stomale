import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function SearchCondition() {
  const [searchTerm, setSearchTerm] = useState("");

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
    onError: (error) => {
      console.error('Query error:', error);
      toast.error("Errore nel caricamento delle patologie");
    }
  });

  const filteredConditions = conditions?.filter(condition =>
    condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Errore nel caricamento delle patologie
          </h1>
          <p className="text-gray-600">
            Si è verificato un errore durante il caricamento delle patologie. Riprova più tardi.
          </p>
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConditions?.map((condition) => (
            <Link 
              key={condition.id} 
              to={`/patologia/${condition.Patologia.toLowerCase()}`}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <h2 className="text-xl font-semibold text-primary">
                  {condition.Patologia}
                </h2>
                {condition.Descrizione && (
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {condition.Descrizione}
                  </p>
                )}
              </Card>
            </Link>
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