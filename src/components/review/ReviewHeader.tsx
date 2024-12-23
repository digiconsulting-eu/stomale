import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewHeaderProps {
  title: string;
  condition: string;
  date: string;
  username?: string;
}

export const ReviewHeader = ({ title, condition, date, username }: ReviewHeaderProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  
  console.log('ReviewHeader received username:', username);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-6">
        <Link 
          to={`/patologia/${condition}`}
          className="text-primary hover:underline"
        >
          ← Leggi tutte le recensioni su {conditionName}
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-4">
        {title || `Esperienza con ${conditionName}`}
      </h1>

      <div className="flex flex-col gap-3">
        {username && (
          <p className="text-gray-600 font-medium">
            {username}
          </p>
        )}
        <div className="flex items-center text-gray-500">
          <Calendar size={16} className="mr-2" />
          <span>{date}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <Link 
          to={`/patologia/${condition}`}
          className="block"
        >
          <Badge 
            variant="secondary" 
            className="inline-flex px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {conditionName}
          </Badge>
        </Link>
      </div>
    </div>
  );
};