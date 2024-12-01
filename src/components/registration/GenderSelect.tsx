import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderSelect = ({ value, onChange }: GenderSelectProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="gender" className="text-sm font-medium">
        Sesso
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleziona sesso" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="M">Maschio</SelectItem>
          <SelectItem value="F">Femmina</SelectItem>
          <SelectItem value="O">Altro</SelectItem>
          <SelectItem value="N">Preferisco non specificare</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};