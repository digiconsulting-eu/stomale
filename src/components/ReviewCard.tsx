import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";

interface ReviewCardProps {
  id: string | number; // Updated to accept both string and number
  title: string;
  condition: string;
  symptoms: string;
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
  symptoms,
  diagnosisDifficulty,
  symptomsSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort,
}: ReviewCardProps) => {
  return (
    <Link to={`/patologia/${condition}/recensione/${id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <Badge variant="outline" className="mb-4">
              {condition}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Sintomi:</span> {symptoms}
            </p>

            {diagnosisDifficulty !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Difficoltà diagnosi:</span>
                <StarRating value={diagnosisDifficulty} readonly />
              </div>
            )}

            {symptomsSeverity !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Gravità sintomi:</span>
                <StarRating value={symptomsSeverity} readonly />
              </div>
            )}

            {hasMedication !== undefined && medicationEffectiveness !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Efficacia terapia:</span>
                <StarRating value={medicationEffectiveness} readonly />
              </div>
            )}

            {healingPossibility !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Possibilità guarigione:</span>
                <StarRating value={healingPossibility} readonly />
              </div>
            )}

            {socialDiscomfort !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Disagio sociale:</span>
                <StarRating value={socialDiscomfort} readonly />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};