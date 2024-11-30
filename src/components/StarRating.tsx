import { Square } from "lucide-react";

interface StarRatingProps {
  value: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export const StarRating = ({ value, readOnly = false, onChange }: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readOnly ? "button" : "submit"}
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Square
            className={`h-5 w-5 ${
              star <= value
                ? 'fill-primary text-primary'
                : 'fill-gray-200 text-gray-200'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};