import { useState } from "react";
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
import { toast } from "sonner";

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: conditions = [], isError } = useQuery({
    queryKey: ['conditions'],
    queryFn: async () => {
      try {
        console.log('Fetching conditions for SearchBar...');
        const { data, error } = await supabase
          .from('PATOLOGIE')
          .select('Patologia')
          .order('Patologia');
        
        if (error) {
          console.error('Error fetching conditions:', error);
          throw error;
        }

        if (!data) {
          console.log('No conditions found');
          return [];
        }

        console.log('Successfully fetched conditions:', data.length);
        return data.map(row => row.Patologia);
      } catch (error) {
        console.error('Error in conditions query:', error);
        if (error.message?.includes('429')) {
          toast.error("Troppe richieste. Per favore, attendi qualche secondo e riprova.");
        } else {
          toast.error("Errore nel caricamento delle patologie");
        }
        return [];
      }
    },
    staleTime: 30000, // Cache data for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isError) {
    toast.error("Errore nel caricamento delle patologie");
  }

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
              Nessuna patologia trovata.
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