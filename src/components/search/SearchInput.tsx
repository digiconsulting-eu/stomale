
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-center mb-4">
        Cerca tra centinaia di patologie
      </h2>
      <Input
        placeholder="Cerca una patologia..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-5xl mx-auto h-14 text-lg px-6 border-[#1EAEDB] focus:border-[#1EAEDB] focus:ring-[#1EAEDB]"
        aria-label="Cerca patologia"
      />
    </div>
  );
};
