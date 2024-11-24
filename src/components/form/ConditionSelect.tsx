import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
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

// Initialize arrays with empty arrays as fallback
const allConditions = [
  ...(CONDITIONS_A || []),
  ...(CONDITIONS_B || []),
  ...(CONDITIONS_C || []),
  ...(CONDITIONS_D || []),
  ...(CONDITIONS_E || []),
  ...(CONDITIONS_F || []),
  ...(CONDITIONS_G || []),
  ...(CONDITIONS_H || []),
  ...(CONDITIONS_I || []),
  ...(CONDITIONS_L || []),
  ...(CONDITIONS_M || []),
  ...(CONDITIONS_N || []),
  ...(CONDITIONS_O || []),
  ...(CONDITIONS_P || []),
  ...(CONDITIONS_R || []),
  ...(CONDITIONS_S || []),
  ...(CONDITIONS_T || []),
  ...(CONDITIONS_U || []),
  ...(CONDITIONS_V || []),
  ...(CONDITIONS_Z || [])
].sort();

interface ConditionSelectProps {
  form: UseFormReturn<any>;
}

export const ConditionSelect = ({ form }: ConditionSelectProps) => {
  const [open, setOpen] = useState(false);

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
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? allConditions.find(
                        (condition) => condition === field.value
                      )
                    : "Seleziona una patologia"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Cerca una patologia..." />
                <CommandEmpty>Nessuna patologia trovata.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {allConditions.map((condition) => (
                    <CommandItem
                      key={condition}
                      value={condition}
                      onSelect={() => {
                        form.setValue("condition", condition);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          condition === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {condition}
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