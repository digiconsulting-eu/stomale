import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface ReviewCardProps {
  id: number;
  title: string;
  condition: string;
  preview: string;
  date: string;
  username: string;
}

export const ReviewCard = ({
  id,
  title,
  condition,
  preview,
  date,
  username,
}: ReviewCardProps) => {
  return (
    <Card className="p-4 h-[300px] flex flex-col justify-between border-2 border-primary">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-primary hover:underline">
            <Link to={`/recensione/${id}`}>{title}</Link>
          </h3>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <Link 
          to={`/patologia/${condition.toLowerCase()}`}
          className="text-sm text-gray-600 hover:underline mb-2 block"
        >
          {condition}
        </Link>
        <p className="text-gray-600 line-clamp-2 mb-1">{preview}</p>
        <p className="text-sm text-gray-500">Recensione di {username}</p>
      </div>
      <Button asChild variant="ghost" className="w-full justify-between mt-2">
        <Link to={`/recensione/${id}`}>
          Leggi recensione completa
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </Button>
    </Card>
  );
};