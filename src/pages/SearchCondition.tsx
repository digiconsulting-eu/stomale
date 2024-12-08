import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const SearchCondition = () => {
  const [selectedLetter, setSelectedLetter] = useState("A");

  const { data: conditions = [], isLoading, error } = useQuery({
    queryKey: ['conditions', selectedLetter],
    queryFn: async () => {
      console.log('Fetching conditions for letter:', selectedLetter);
      
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('Patologia')
        .ilike('Patologia', `${selectedLetter}%`)
        .order('Patologia');
      
      if (error) {
        console.error('Error fetching conditions:', error);
        throw error;
      }
      
      console.log('Fetched conditions:', data);
      return data?.map(row => row.Patologia) || [];
    }
  });

  const handleLetterChange = (letter: string) => {
    console.log('Changing letter to:', letter);
    setSelectedLetter(letter);
    window.scrollTo(0, 0);
  };

  if (error) {
    console.error('Query error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Si è verificato un errore nel caricamento delle patologie. Riprova più tardi.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Alphabet Navigation */}
      <nav className="mb-8 sticky top-20 bg-white/80 backdrop-blur-sm z-40 py-4 border-b">
        <div className="flex flex-wrap gap-2 justify-center">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterChange(letter)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-all
                ${
                  selectedLetter === letter
                    ? "bg-primary text-white shadow-lg scale-110"
                    : "bg-secondary hover:bg-secondary-hover text-text"
                }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </nav>

      {/* Conditions List */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-2">
            <span className="text-primary">{selectedLetter}</span>
            <span className="text-text-light">/</span>
            <span className="text-text-light font-normal text-xl">Patologie</span>
          </h2>

          {isLoading ? (
            <div className="text-center py-8">Caricamento...</div>
          ) : conditions.length > 0 ? (
            <div className="grid gap-3">
              {conditions.map((condition) => (
                <Link
                  key={condition}
                  to={`/patologia/${encodeURIComponent(condition.toLowerCase())}`}
                  className="card group hover:border-primary/20 transition-all"
                >
                  <h3 className="text-lg font-medium text-text group-hover:text-primary transition-colors">
                    {condition}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-light">
              Nessuna patologia trovata per la lettera {selectedLetter}
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-primary hover:text-primary-hover transition-colors"
          >
            Torna all'indice alfabetico ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCondition;