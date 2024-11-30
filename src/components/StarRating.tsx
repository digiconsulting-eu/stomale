import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export const StarRating = ({ value, onChange, className }: StarRatingProps) => {
  return (
    <div className={cn("flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onChange(rating);
          }}
          className={cn(
            "p-0 w-6 h-6",
            rating <= value ? "text-yellow-400" : "text-gray-300"
          )}
        >
          <Star className="w-full h-full fill-current" />
        </button>
      ))}
    </div>
  );
};