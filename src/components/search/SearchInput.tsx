import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="mb-8">
      <Input
        placeholder="Cerca una patologia..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-5xl mx-auto h-14 text-lg px-6"
      />
    </div>
  );
};