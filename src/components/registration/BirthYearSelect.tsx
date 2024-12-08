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
</Ah, I see the issue. The error occurs because we're passing a `disabled` prop to `BirthYearSelect` and `GenderSelect` components, but their interfaces don't include this property. Let's fix this by updating both component interfaces.

<lov-code>
First, let's update the BirthYearSelect component:

<lov-write file_path="src/components/registration/BirthYearSelect.tsx">
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