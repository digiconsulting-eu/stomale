import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BirthYearSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const BirthYearSelect = ({ value, onChange, disabled }: BirthYearSelectProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-2">
      <label htmlFor="birthYear" className="text-sm font-medium">
        Anno di Nascita
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleziona anno" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};