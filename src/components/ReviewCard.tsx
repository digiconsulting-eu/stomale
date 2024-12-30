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
  username?: string;
}

export const ReviewCard = ({
  id,
  title,
  condition,
  experience,
  username,
}: ReviewCardProps) => {
  console.log('ReviewCard received username:', username);

  // Function to format the username
  const formatUsername = (username?: string) => {
    if (!username) return 'Anonimo';
    if (username.startsWith('Anonimo')) return 'Anonimo';
    return username;
  };

  // Function to truncate text to roughly 2 lines (approximately 150 characters)
  const truncateExperience = (text: string = '') => {
    if (text.length <= 150) return text;
    return text.slice(0, 150).trim() + "...";
  };

  // Function to create URL-friendly slug from title
  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <Card className="bg-white p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          {username && (
            <p className="text-sm text-gray-600 mb-2">Scritto da {formatUsername(username)}</p>
          )}
          <Link 
            to={`/patologia/${condition.toLowerCase()}`}
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

        <Link to={`/patologia/${condition}/recensione/${createSlug(title)}`}>
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