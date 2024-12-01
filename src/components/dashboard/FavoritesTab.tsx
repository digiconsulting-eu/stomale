import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationBadge } from "@/components/ui/notification-badge";

interface FavoritesTabProps {
  favoriteConditions: string[];
  notifications: { [key: string]: number };
  removeFavorite: (condition: string) => void;
}

export const FavoritesTab = ({ favoriteConditions, notifications, removeFavorite }: FavoritesTabProps) => {
  if (favoriteConditions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Non hai ancora salvato patologie preferite</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/cerca-patologia">Cerca una patologia</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favoriteConditions.map((condition) => (
        <Card key={condition} className="p-4">
          <div className="flex justify-between items-start">
            <Link 
              to={`/patologia/${condition}`}
              className="text-lg font-semibold text-primary hover:underline relative"
            >
              {condition}
              {notifications[condition] > 0 && (
                <NotificationBadge count={notifications[condition]} />
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFavorite(condition)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};