
import { useState, useEffect } from "react";
import { Search, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { useConditions } from "@/hooks/useConditions";

import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "../conditions";

// Use the built-in list of conditions as fallback
const allConditions = [
  ...(CONDITIONS_A ?? []),
  ...(CONDITIONS_B ?? []),
  ...(CONDITIONS_C ?? []),
  ...(CONDITIONS_D ?? []),
  ...(CONDITIONS_E ?? []),
  ...(CONDITIONS_F ?? []),
  ...(CONDITIONS_G ?? []),
  ...(CONDITIONS_H ?? []),
  ...(CONDITIONS_I ?? []),
  ...(CONDITIONS_L ?? []),
  ...(CONDITIONS_M ?? []),
  ...(CONDITIONS_N ?? []),
  ...(CONDITIONS_O ?? []),
  ...(CONDITIONS_P ?? []),
  ...(CONDITIONS_R ?? []),
  ...(CONDITIONS_S ?? []),
  ...(CONDITIONS_T ?? []),
  ...(CONDITIONS_U ?? []),
  ...(CONDITIONS_V ?? []),
  ...(CONDITIONS_Z ?? [])
].filter(Boolean).sort();

interface ConditionSelectProps {
  form: UseFormReturn<any>;
}

const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? 
          <span key={i} className="bg-yellow-100 font-medium">{part}</span> : 
          part
      )}
    </>
  );
};

// Helper function to normalize text for comparison
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

export const ConditionSelect = ({ form }: ConditionSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [filteredConditions, setFilteredConditions] = useState<{id?: number; Patologia: string}[]>([]);
  const [isCustomValue, setIsCustomValue] = useState(false);
  const { data: conditionsData, isLoading: isLoadingConditions, error } = useConditions({
    searchTerm: searchQuery,
    limit: 50 // Aumentiamo il limite per mostrare più risultati
  });
  
  // Use database conditions if available, otherwise use static list
  useEffect(() => {
    if (conditionsData?.conditions) {
      // Directly use the database format (with id and Patologia)
      const dbConditions = conditionsData.conditions;
      console.log(`Loaded ${dbConditions.length} conditions from database`);
      
      const normalizedSearchQuery = normalizeText(searchQuery);
      
      if (normalizedSearchQuery) {
        // Check if the current search query matches any item
        const exactMatch = dbConditions.some(condition => 
          normalizeText(condition.Patologia) === normalizedSearchQuery
        );
        
        // Additional check for close matches (e.g., with/without capitalization or spaces)
        const closeMatch = dbConditions.some(condition => {
          const condNormalized = normalizeText(condition.Patologia);
          return (
            condNormalized.includes(normalizedSearchQuery) || 
            normalizedSearchQuery.includes(condNormalized)
          );
        });
        
        // Set custom value flag
        setIsCustomValue(searchQuery.length > 0 && !exactMatch && !closeMatch);
        
        // Filter conditions based on search query
        const filtered = dbConditions.filter(condition => 
          normalizeText(condition.Patologia).includes(normalizedSearchQuery)
        );
        
        console.log(`Found ${filtered.length} matches for "${searchQuery}"`, filtered.slice(0, 3));
        setFilteredConditions(filtered);
      } else {
        setIsCustomValue(false);
        setFilteredConditions(dbConditions);
      }
    } else {
      // Use static backup list if database fails
      if (error) {
        console.warn('Using static conditions list due to API error:', error);
      }
      
      const staticConditions = allConditions.map(cond => ({ Patologia: cond }));
      
      // Add debugging for fallback conditions
      console.log(`Using ${staticConditions.length} conditions from static list`);
      
      const normalizedSearchQuery = normalizeText(searchQuery);
      
      if (normalizedSearchQuery) {
        // Check if the current search query matches any item exactly
        const exactMatch = staticConditions.some(condition => 
          normalizeText(condition.Patologia) === normalizedSearchQuery
        );
        
        // Set custom value flag
        setIsCustomValue(searchQuery.length > 0 && !exactMatch);
        
        if (searchQuery) {
          const filtered = staticConditions.filter(condition => 
            normalizeText(condition.Patologia).includes(normalizedSearchQuery)
          );
          setFilteredConditions(filtered);
        } else {
          setFilteredConditions(staticConditions);
        }
      } else {
        setIsCustomValue(false);
        setFilteredConditions(staticConditions);
      }
    }
  }, [conditionsData, searchQuery, error]);

  useEffect(() => {
    const value = form.getValues("condition");
    if (value) {
      setSelectedValue(value);
    }
  }, [form]);

  // Handle auto-selection when there's an exact match
  useEffect(() => {
    if (!open && searchQuery) {
      const normalizedSearch = normalizeText(searchQuery);
      
      // Check if there's an exact match in the filtered conditions
      const exactMatch = filteredConditions.find(
        condition => normalizeText(condition.Patologia) === normalizedSearch
      );
      
      if (exactMatch) {
        // Auto-select the exact match
        console.log('Auto-selecting exact match:', exactMatch.Patologia);
        form.setValue("condition", exactMatch.Patologia, { shouldValidate: true });
        setSelectedValue(exactMatch.Patologia);
        setIsCustomValue(false);
        setSearchQuery(""); // Clear search query
      } else if (isCustomValue) {
        // If we have a selected value but it's not validated, clear it
        console.log('Clearing invalid selected value:', selectedValue);
        form.setValue("condition", "", { shouldValidate: true });
        setSelectedValue("");
      }
    }
  }, [open, searchQuery, filteredConditions, form, isCustomValue, selectedValue]);

  return (
    <FormField
      control={form.control}
      name="condition"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Patologia *</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full px-6 py-7 pl-14 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 backdrop-blur-sm shadow-lg text-lg justify-start font-normal hover:bg-white/90 relative",
                    !field.value && "text-gray-500",
                    isCustomValue && "border-red-300"
                  )}
                >
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} />
                  {selectedValue || field.value || "Seleziona una patologia"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-5 top-1/2 -translate-y-1/2" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command className="rounded-lg border shadow-md bg-white" shouldFilter={false}>
                <CommandInput 
                  placeholder="Cerca una patologia..." 
                  onValueChange={setSearchQuery}
                  value={searchQuery}
                  className="h-12 border-b border-gray-100 text-gray-900 placeholder:text-gray-500"
                />
                <CommandList className="max-h-[300px] overflow-y-auto p-2 bg-white">
                  {isLoadingConditions && (
                    <div className="py-6 text-center text-gray-500">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                      <p className="mt-2">Caricamento patologie...</p>
                    </div>
                  )}
                  
                  {isCustomValue && (
                    <div className="p-2 text-sm text-red-500 bg-red-50 rounded border border-red-100 mb-2">
                      <p>Patologia non trovata. Seleziona una patologia dall'elenco.</p>
                    </div>
                  )}
                  
                  <CommandEmpty className="py-6 text-center text-gray-500">
                    Nessuna patologia trovata con "{searchQuery}".
                  </CommandEmpty>
                  
                  <CommandGroup>
                    {filteredConditions.map((condition) => (
                      <CommandItem
                        key={condition.id || condition.Patologia}
                        value={condition.Patologia}
                        onSelect={() => {
                          console.log('Selected condition:', condition.Patologia);
                          form.setValue("condition", condition.Patologia, { shouldValidate: true });
                          setSelectedValue(condition.Patologia);
                          setIsCustomValue(false);
                          setOpen(false);
                        }}
                        className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-3 text-gray-900 text-[15px] outline-none hover:bg-gray-100 data-[selected=true]:bg-gray-100"
                      >
                        <Check
                          className={cn(
                            "mr-3 h-4 w-4 text-primary",
                            condition.Patologia === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <HighlightMatch text={condition.Patologia} query={searchQuery} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
