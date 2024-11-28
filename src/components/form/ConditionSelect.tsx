import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "../conditions";

// Ensure each array exists with a default empty array if undefined
const allConditions = [
  ...CONDITIONS_A || [],
  ...CONDITIONS_B || [],
  ...CONDITIONS_C || [],
  ...CONDITIONS_D || [],
  ...CONDITIONS_E || [],
  ...CONDITIONS_F || [],
  ...CONDITIONS_G || [],
  ...CONDITIONS_H || [],
  ...CONDITIONS_I || [],
  ...CONDITIONS_L || [],
  ...CONDITIONS_M || [],
  ...CONDITIONS_N || [],
  ...CONDITIONS_O || [],
  ...CONDITIONS_P || [],
  ...CONDITIONS_R || [],
  ...CONDITIONS_S || [],
  ...CONDITIONS_T || [],
  ...CONDITIONS_U || [],
  ...CONDITIONS_V || [],
  ...CONDITIONS_Z || []
].filter(Boolean).sort();

interface ConditionSelectProps {
  form: UseFormReturn<any>;
}

// Helper function to highlight matched text
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? 
          <span key={i} className="bg-yellow-100 dark:bg-yellow-900">{part}</span> : 
          part
      )}
    </>
  );
};

export const ConditionSelect = ({ form }: ConditionSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
                  {field.value
                    ? allConditions.find(
                        (condition) => condition === field.value
                      )
                    : "Seleziona una patologia"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-5 top-1/2 -translate-y-1/2" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command className="rounded-lg border shadow-md bg-white">
                <CommandInput 
                  placeholder="Cerca una patologia..." 
                  className="h-12 text-gray-700 placeholder:text-gray-400"
                  onValueChange={setSearchQuery}
                />
                <CommandEmpty className="py-6 text-gray-500">
                  Nessuna patologia trovata.
                </CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {allConditions.map((condition) => (
                    <CommandItem
                      key={condition}
                      value={condition}
                      onSelect={() => {
                        form.setValue("condition", condition);
                        setOpen(false);
                      }}
                      className="hover:bg-gray-100 cursor-pointer py-2 px-3 text-gray-700"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          condition === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <HighlightMatch text={condition} query={searchQuery} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};