import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "../conditions";

// Ensure each array exists with a default empty array and filter out undefined values
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
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Cerca una patologia..." 
                  onValueChange={setSearchQuery}
                  value={searchQuery}
                  className="h-12"
                />
                <CommandList>
                  <CommandEmpty>Nessuna patologia trovata.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {allConditions
                      .filter(condition => 
                        condition.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((condition) => (
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