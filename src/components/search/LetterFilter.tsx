
import { Button } from "@/components/ui/button";

interface LetterFilterProps {
  selectedLetter: string;
  onLetterSelect: (letter: string) => void;
}

export const LetterFilter = ({ selectedLetter, onLetterSelect }: LetterFilterProps) => {
  const letters = ["TUTTE", "A", "B", "C", "D", "E", "F", "G", "H", "I", "L", "M", 
                  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "Z"];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {letters.map((letter) => (
        <Button
          key={letter}
          variant={selectedLetter === letter ? "default" : "outline"}
          onClick={() => onLetterSelect(letter)}
          className={`min-w-[40px] ${selectedLetter === letter ? "text-white" : ""}`}
        >
          {letter}
        </Button>
      ))}
    </div>
  );
};
