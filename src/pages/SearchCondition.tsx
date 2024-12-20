import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function SearchCondition() {
  const [conditions, setConditions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("TUTTE");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Cerca Patologia"));
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      console.log('Starting conditions fetch from PATOLOGIE table...');
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw PATOLOGIE response:', data);
      console.log('Number of conditions fetched:', data?.length || 0);
      
      if (!data) {
        console.log('No data returned from PATOLOGIE table');
        return;
      }

      setConditions(data);
    } catch (error) {
      console.error('Error fetching conditions:', error);
      toast.error("Errore nel caricamento delle patologie");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConditions = conditions.filter(condition => {
    return condition.Patologia.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cerca Patologia</h1>
      <div className="mb-4">
        <Input
          placeholder="Cerca una patologia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredConditions.map(condition => (
            <div key={condition.id} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{condition.Patologia}</h2>
            </div>
          ))}
          {filteredConditions.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Nessuna patologia trovata.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
