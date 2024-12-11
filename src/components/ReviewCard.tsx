import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";

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
  diagnosisDifficulty,
  symptomsSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort,
}: ReviewCardProps) => {
  // Function to truncate text to roughly 2 lines (approximately 150 characters)
  const truncateExperience = (text: string = '') => {
    if (text.length <= 150) return text;
    return text.slice(0, 150).trim() + "...";
  };

  return (
    <Link to={`/patologia/${condition}/recensione/${id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
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

          <p className="text-sm text-gray-600 line-clamp-2">
            {truncateExperience(experience)}
          </p>

          <div className="space-y-2">
            {diagnosisDifficulty !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Difficoltà diagnosi:</span>
                <StarRating value={diagnosisDifficulty} readOnly />
              </div>
            )}

            {symptomsSeverity !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Gravità sintomi:</span>
                <StarRating value={symptomsSeverity} readOnly />
              </div>
            )}

            {hasMedication !== undefined && medicationEffectiveness !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Efficacia terapia:</span>
                <StarRating value={medicationEffectiveness} readOnly />
              </div>
            )}

            {healingPossibility !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Possibilità guarigione:</span>
                <StarRating value={healingPossibility} readOnly />
              </div>
            )}

            {socialDiscomfort !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Disagio sociale:</span>
                <StarRating value={socialDiscomfort} readOnly />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};