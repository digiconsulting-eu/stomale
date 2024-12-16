import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
}

export const ReviewCard = ({
  id,
  title,
  condition,
  experience,
}: ReviewCardProps) => {
  // Function to truncate text to roughly 2 lines (approximately 150 characters)
  const truncateExperience = (text: string = '') => {
    if (text.length <= 150) return text;
    return text.slice(0, 150).trim() + "...";
  };

  return (
    <Card className="bg-white p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <Badge 
            variant="outline" 
            className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          >
            {condition}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {truncateExperience(experience)}
        </p>

        <Link to={`/patologia/${condition}/recensione/${id}`}>
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