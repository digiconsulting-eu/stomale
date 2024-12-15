import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ConditionCardProps = {
  condition: string | {
    id: number;
    Patologia: string;
    Descrizione: string | null;
  };
};

export const ConditionCard = ({ condition }: ConditionCardProps) => {
  const conditionName = typeof condition === 'string' ? condition : condition.Patologia;
  const description = typeof condition === 'string' ? null : condition.Descrizione;

  return (
    <Link to={`/patologia/${conditionName.toLowerCase()}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative">
        <div className="flex flex-col h-full">
          <h2 className="font-semibold mb-2">{conditionName}</h2>
          {description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-1">
              {description}
            </p>
          )}
          <div className="mt-auto flex justify-between items-center">
            <Button 
              variant="default" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Leggi Esperienza
            </Button>
            <Badge variant="outline">
              Scopri di più
            </Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
};