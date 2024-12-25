import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewsGrid } from "@/components/reviews/ReviewsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { setPageTitle, getDefaultPageTitle, setMetaDescription } from "@/utils/pageTitle";

export default function SearchSymptoms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isSearching, setIsSearching] = useState(!!initialSearchTerm);

  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Cerca Sintomi"));
    setMetaDescription("Cerca recensioni ed esperienze in base ai sintomi. Trova testimonianze di persone che hanno avuto sintomi simili ai tuoi su StoMale.info.");
  }, []);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['symptom-reviews', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      console.log('Searching reviews with symptoms:', searchTerm);
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            title,
            experience,
            symptoms,
            diagnosis_difficulty,
            symptoms_severity,
            has_medication,
            medication_effectiveness,
            healing_possibility,
            social_discomfort,
            users (
              username
            ),
            PATOLOGIE (
              Patologia
            )
          `)
          .eq('status', 'approved')
          .textSearch('symptoms_searchable', searchTerm, {
            config: 'italian_unaccent',
            type: 'websearch'
          })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          throw error;
        }

        console.log('Found reviews:', data);
        return data || [];
      } catch (error) {
        console.error('Error searching reviews:', error);
        toast.error("Errore durante la ricerca delle recensioni");
        return [];
      }
    },
    enabled: isSearching && searchTerm.length > 0
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
      setIsSearching(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Cerca Sintomi</h1>
      
      <div className="mb-8">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            placeholder="Inserisci i sintomi da cercare..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (isSearching) setIsSearching(false);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="px-6">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isSearching && (
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[300px]" />
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold mb-6">
                Recensioni trovate: {reviews.length}
              </h2>
              <ReviewsGrid reviews={reviews} isLoading={isLoading} />
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nessuna recensione trovata con i sintomi specificati.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 bg-white rounded-lg p-6 text-sm text-text-light">
        <p className="mb-4">
          Su StoMale.info puoi cercare recensioni basate sui sintomi descritti dagli utenti. 
          Inserisci i sintomi che ti interessano per trovare esperienze di persone che hanno avuto sintomi simili.
        </p>
        <p className="mb-4">
          Ricorda che questo strumento serve solo per consultare esperienze di altri utenti e 
          NON deve essere utilizzato per autodiagnosi o come sostituto di una consulenza medica.
        </p>
        <p>
          È sempre necessario consultare un medico o uno specialista per una corretta diagnosi 
          e per la prescrizione di eventuali trattamenti.
        </p>
      </div>
    </div>
  );
}
