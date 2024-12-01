import { useState, useEffect } from "react";
import { Search, Check, ChevronsUpDown } from "lucide-react";
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const fetchConditions = async () => {
  const { data, error } = await supabase
    .from('PATOLOGIE')
    .select('Patologia')
    .order('Patologia');
    
  if (error) throw error;
  return data.map(item => item.Patologia);
};

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

export const ConditionSelect = ({ form }: ConditionSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const { data: conditions = [], isLoading } = useQuery({
    queryKey: ['conditions'],
    queryFn: fetchConditions,
  });

  useEffect(() => {
    const value = form.getValues("condition");
    if (value) {
      setSelectedValue(value);
    }
  }, [form]);

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
                    !field.value && "text-gray-500"
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
                  <CommandEmpty className="py-6 text-center text-gray-500">
                    {isLoading ? "Caricamento..." : "Nessuna patologia trovata."}
                  </CommandEmpty>
                  <CommandGroup>
                    {conditions
                      .filter(condition => 
                        condition.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((condition) => (
                        <CommandItem
                          key={condition}
                          value={condition}
                          onSelect={() => {
                            form.setValue("condition", condition);
                            setSelectedValue(condition);
                            setOpen(false);
                          }}
                          className="relative flex cursor-pointer select-none items-center rounded-md px-4 py-3 text-gray-900 text-[15px] outline-none hover:bg-gray-100 data-[selected=true]:bg-gray-100"
                        >
                          <Check
                            className={cn(
                              "mr-3 h-4 w-4 text-primary",
                              condition === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <HighlightMatch text={condition} query={searchQuery} />
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