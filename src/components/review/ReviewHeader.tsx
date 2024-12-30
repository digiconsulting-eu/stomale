import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
  // Function to format the username
  const formatUsername = (username?: string) => {
    if (!username) return 'Anonimo';
    // If username starts with 'Anonimo', return just 'Anonimo'
    if (username.startsWith('Anonimo')) return 'Anonimo';
    return username;
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600">
          Scritto da {formatUsername(username)}
        </p>
        <p className="text-sm text-gray-600 mb-4">{date}</p>
        <Link 
          to={`/patologia/${condition.toLowerCase()}`}
          className="inline-block"
        >
          <Badge 
            variant="outline" 
            className="text-[#0EA5E9] hover:text-[#0EA5E9]/80 bg-[#0EA5E9]/10 border-[#0EA5E9]/20 hover:bg-[#0EA5E9]/20 cursor-pointer transition-colors"
          >
            {capitalizeFirstLetter(condition)}
          </Badge>
        </Link>
      </div>
    </div>
  );
};