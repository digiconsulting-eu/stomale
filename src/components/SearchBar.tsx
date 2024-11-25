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
import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "./conditions";

// Combine all conditions and sort them alphabetically
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

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full px-6 py-7 pl-14 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 backdrop-blur-sm shadow-lg text-lg justify-start font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} />
        <span className="text-muted-foreground">Cerca sintomi o patologie...</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Cerca una patologia..." />
          <CommandList>
            <CommandEmpty>Nessuna patologia trovata.</CommandEmpty>
            <CommandGroup heading="Patologie">
              {allConditions.map((condition) => (
                <CommandItem
                  key={condition}
                  value={condition}
                  onSelect={() => {
                    navigate(`/patologia/${encodeURIComponent(condition.toLowerCase())}`);
                    setOpen(false);
                  }}
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