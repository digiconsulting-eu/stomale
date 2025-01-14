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
    <Card className="bg-white rounded-3xl border border-[#1EAEDB] shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-[#2C3E50] hover:text-primary">
            <Link to={`/patologia/${condition.toLowerCase()}/esperienza/${id}-${title.toLowerCase().replace(/\s+/g, '-')}`}>{title}</Link>
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-2">{username}</p>
        <Link 
          to={`/patologia/${condition.toLowerCase()}`}
          className="inline-block px-4 py-1 bg-[#E4F1FF] text-primary rounded-full text-sm mb-3 hover:bg-primary/10"
        >
          {condition}
        </Link>
        <p className="text-gray-600 line-clamp-2 mb-4">{preview}</p>
        <Button 
          asChild 
          className="w-full bg-primary text-white hover:bg-primary-hover justify-center rounded-xl py-6"
        >
          <Link to={`/patologia/${condition.toLowerCase()}/esperienza/${id}-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            Leggi l'esperienza completa
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </Card>
  );
};