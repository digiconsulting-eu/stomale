import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const fetchConditions = async () => {
  const { data, error } = await supabase
    .from('PATOLOGIE')
    .select('id')
    .order('id');
    
  if (error) throw error;
  return data.map(item => item.id);
};

const getConditionsByLetter = (conditions: string[], letter: string) => {
  // Get approved conditions from localStorage
  const approvedConditions = JSON.parse(localStorage.getItem('approvedConditions') || '[]');
  
  // Filter conditions that start with the current letter
  const baseConditions = conditions.filter(condition => 
    condition.startsWith(letter)
  );

  // Filter approved conditions that start with the current letter
  const approvedForLetter = approvedConditions.filter((condition: string) => 
    condition.startsWith(letter)
  );

  // Combine and sort all conditions
  return [...baseConditions, ...approvedForLetter].sort();
};

const SearchCondition = () => {
  const [selectedLetter, setSelectedLetter] = useState("A");

  const { data: allConditions = [], isLoading } = useQuery({
    queryKey: ['conditions'],
    queryFn: fetchConditions,
  });

  const conditions = getConditionsByLetter(allConditions, selectedLetter);

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter);
    window.scrollTo(0, 0);
  };

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

          <div className="grid gap-3">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Caricamento patologie...</div>
            ) : conditions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nessuna patologia trovata per questa lettera.</div>
            ) : (
              conditions.map((condition) => (
                <Link
                  key={condition}
                  to={`/patologia/${encodeURIComponent(condition.toLowerCase())}`}
                  className="card group hover:border-primary/20 transition-all"
                >
                  <h3 className="text-lg font-medium text-text group-hover:text-primary transition-colors">
                    {condition}
                  </h3>
                </Link>
              ))
            )}
          </div>
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