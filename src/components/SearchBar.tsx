import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const fetchConditions = async () => {
  const { data, error } = await supabase
    .from('PATOLOGIE')
    .select('id')
    .order('id');
    
  if (error) throw error;
  return data.map(item => item.id);
};

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: conditions = [], isLoading } = useQuery({
    queryKey: ['conditions'],
    queryFn: fetchConditions,
  });

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full px-6 py-7 pl-14 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 backdrop-blur-sm shadow-lg text-lg justify-start font-normal hover:bg-white/90"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} />
        <span className="text-gray-500">Cerca sintomi o patologie...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md bg-white">
          <CommandInput 
            placeholder="Cerca una patologia..." 
            className="h-12 text-gray-700 placeholder:text-gray-400"
          />
          <CommandList className="text-gray-700 bg-white">
            <CommandEmpty className="py-6 text-gray-500">
              {isLoading ? "Caricamento..." : "Nessuna patologia trovata."}
            </CommandEmpty>
            <CommandGroup heading="Patologie" className="text-gray-900 font-medium">
              {conditions.map((condition) => (
                <CommandItem
                  key={condition}
                  value={condition}
                  onSelect={() => {
                    navigate(`/patologia/${encodeURIComponent(condition.toLowerCase())}`);
                    setOpen(false);
                  }}
                  className="hover:bg-gray-100 cursor-pointer py-2 px-3 text-gray-700"
                >
                  {condition}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};