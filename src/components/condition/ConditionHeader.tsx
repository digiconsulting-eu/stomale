import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ConditionHeaderProps {
  condition: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const ConditionHeader = ({ condition, isFavorite, onToggleFavorite }: ConditionHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-primary">
        {capitalizeFirstLetter(condition)}
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleFavorite}
        className={`${isFavorite ? 'text-primary' : 'text-gray-400'} hover:text-primary`}
      >
        <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};