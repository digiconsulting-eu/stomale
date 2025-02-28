
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewHeaderProps {
  title: string;
  condition: string;
  date: string;
  username?: string;
}

export const ReviewHeader = ({ 
  title, 
  condition,
  date,
  username 
}: ReviewHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-gray-900">{title}</h1>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{username || 'Anonimo'}</span>
          <span className="mx-2">•</span>
          <span>{date}</span>
        </div>
        <Link 
          to={`/patologia/${encodeURIComponent(condition.toLowerCase())}`}
          className="inline-block"
        >
          <Badge 
            variant="outline" 
            className="text-[#0EA5E9] hover:text-[#0EA5E9]/80 bg-[#0EA5E9]/10 border-[#0EA5E9]/20 hover:bg-[#0EA5E9]/20 cursor-pointer transition-colors"
          >
            {condition.toUpperCase()}
          </Badge>
        </Link>
      </div>
    </div>
  );
};
