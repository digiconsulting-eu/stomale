import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface ReviewCardProps {
  id: string | number;
  title: string;
  condition: string;
  experience: string;
  diagnosisDifficulty?: number;
  symptomsSeverity?: number;
  hasMedication?: boolean;
  medicationEffectiveness?: number;
  healingPossibility?: number;
  socialDiscomfort?: number;
  username?: string;
}

export const ReviewCard = ({
  id,
  title,
  condition,
  experience,
  username,
}: ReviewCardProps) => {
  const truncateExperience = (text: string = '') => {
    if (text.length <= 150) return text;
    return text.slice(0, 150).trim() + "...";
  };

  // Ensure condition is properly formatted for the URL
  const formattedCondition = condition.toLowerCase();

  return (
    <Card className="bg-white p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <User className="h-4 w-4" />
            <span>{username || 'Anonimo'}</span>
          </div>
          <Link 
            to={`/patologia/${formattedCondition}`}
            className="inline-block"
          >
            <Badge 
              variant="outline" 
              className="mb-4 text-[#0EA5E9] hover:text-[#0EA5E9]/80 bg-[#0EA5E9]/10 border-[#0EA5E9]/20 hover:bg-[#0EA5E9]/20 cursor-pointer transition-colors"
            >
              {condition}
            </Badge>
          </Link>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {truncateExperience(experience)}
        </p>

        <Link to={`/recensione/${id}`}>
          <Button 
            className="w-full bg-primary text-white hover:bg-primary-hover"
          >
            Leggi
          </Button>
        </Link>
      </div>
    </Card>
  );
};