import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();

  const { data: conditions = [] } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      console.log('Fetching conditions for SearchBar...');
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('Patologia')
        .order('Patologia');

      if (error) {
        console.error('Error fetching conditions:', error);
        throw error;
      }

      return data.map(item => item.Patologia) || [];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
  });

  const handleSearch = (term: string = searchTerm) => {
    if (term) {
      const exactMatch = conditions.find(
        condition => condition.toLowerCase() === term.toLowerCase()
      );
      
      if (exactMatch) {
        navigate(`/patologia/${exactMatch.toLowerCase()}`);
      } else {
        navigate(`/cerca-patologia?q=${encodeURIComponent(term)}`);
      }
      
      setSearchTerm("");
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Update suggestions when user types
  const updateSuggestions = (value: string) => {
    setSearchTerm(value);
    if (value.length > 0 && conditions.length > 0) {
      const filtered = conditions.filter(condition =>
        condition.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Cerca una patologia..."
            value={searchTerm}
            onChange={(e) => updateSuggestions(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-4 pr-10 py-2"
          />
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSearch(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button 
          onClick={() => handleSearch()}
          className="px-6"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};