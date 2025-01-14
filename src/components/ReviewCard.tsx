import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewCardProps {
  id: number;
  title: string;
  condition: string;
  date: string;
  username?: string;
  preview: string;
}

export const ReviewCard = ({ 
  id, 
  title, 
  condition,
  username,
  preview 
}: ReviewCardProps) => {
  if (!condition || !title) {
    console.error('ReviewCard missing required props:', { condition, title });
    return null;
  }

  const formattedCondition = condition.toLowerCase();
  const formattedTitle = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-[350px]">
      {/* Title */}
      <Link 
        to={`/patologia/${formattedCondition}/esperienza/${id}-${formattedTitle}`}
        className="hover:text-primary transition-colors"
      >
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
      </Link>

      {/* Username */}
      <p className="text-sm text-gray-600 mb-2">
        {username || 'Anonimo'}
      </p>

      {/* Condition Badge */}
      <Link 
        to={`/patologia/${formattedCondition}`}
        className="inline-block mb-3"
      >
        <Badge 
          variant="outline" 
          className="text-primary hover:text-primary/80 bg-primary/10 border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
        >
          {capitalizeFirstLetter(condition)}
        </Badge>
      </Link>

      {/* Preview Text */}
      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
        {preview}
      </p>

      {/* Read More Button */}
      <Link 
        to={`/patologia/${formattedCondition}/esperienza/${id}-${formattedTitle}`}
        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors mt-auto text-sm"
      >
        Leggi l'esperienza completa
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
};