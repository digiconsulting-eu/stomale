import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReviewCardProps {
  id: number;
  title: string;
  condition: string;
  date: string;
  preview: string;
  username: string;
}

export const ReviewCard = ({
  id,
  title,
  condition,
  date,
  preview,
  username,
}: ReviewCardProps) => {
  return (
    <Card className="h-[350px] flex flex-col border-2 border-primary">
      <CardHeader className="pb-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-500">
            {condition} • {date}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-gray-600 line-clamp-4">{preview}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4">
        <span className="text-sm text-gray-500">{username}</span>
        <Link to={`/recensione/${id}`}>
          <Button variant="secondary" size="sm">
            Leggi di più
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};