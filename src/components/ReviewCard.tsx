import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
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
  date,
  username,
  preview 
}: ReviewCardProps) => {
  const formattedCondition = condition.toLowerCase();
  const formattedTitle = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{username || 'Anonimo'}</span>
          </div>
          <p className="text-sm text-gray-600">{date}</p>
          <Link 
            to={`/patologia/${formattedCondition}`}
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
      </CardHeader>
      <CardContent className="flex-grow">
        <Link 
          to={`/patologia/${formattedCondition}/esperienza/${id}-${formattedTitle}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
        </Link>
        <p className="text-gray-600 line-clamp-3">{preview}</p>
      </CardContent>
      <CardFooter>
        <Link 
          to={`/patologia/${formattedCondition}/esperienza/${id}-${formattedTitle}`}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Leggi l'esperienza completa →
        </Link>
      </CardFooter>
    </Card>
  );
};