import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";

interface ReviewContentProps {
  title: string;
  condition: string;
  date: string;
  symptoms: string;
  experience: string;
}

export const ReviewContent = ({ title, condition, date, symptoms, experience }: ReviewContentProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-2">
        {title || `Esperienza con ${conditionName}`}
      </h1>
      
      <div className="flex items-center gap-4 mb-6">
        <Badge variant="secondary" className="px-4 py-1.5">
          <a 
            href={`/patologia/${condition}`}
            className="hover:underline"
          >
            {conditionName}
          </a>
        </Badge>
        <div className="flex items-center text-text-light">
          <Calendar size={14} className="mr-1" />
          <span className="text-sm">{date}</span>
        </div>
      </div>

      <div className="prose prose-lg max-w-none mb-8">
        <h2 className="text-xl font-semibold mb-4">Sintomi</h2>
        <p className="whitespace-pre-wrap mb-6">{symptoms}</p>

        <h2 className="text-xl font-semibold mb-4">Esperienza</h2>
        <p className="whitespace-pre-wrap mb-8">{experience}</p>
      </div>
    </div>
  );
};