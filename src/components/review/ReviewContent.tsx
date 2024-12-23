import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Disclaimer } from "@/components/Disclaimer";
import { CommentSection } from "@/components/CommentSection";
import { ReviewStats } from "@/components/ReviewStats";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ReviewContentProps {
  title: string;
  condition: string;
  date: string;
  symptoms: string;
  experience: string;
  diagnosisDifficulty: number;
  symptomSeverity: number;
  hasMedication: boolean;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
  reviewId: string;
  username?: string;
}

export const ReviewContent = ({ 
  title, 
  condition, 
  date, 
  symptoms, 
  experience,
  diagnosisDifficulty,
  symptomSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort,
  reviewId,
  username
}: ReviewContentProps) => {
  const conditionName = capitalizeFirstLetter(condition);
  
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <a 
          href={`/patologia/${condition}`}
          className="text-primary hover:underline"
        >
          ← Leggi tutte le recensioni su {conditionName}
        </a>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-2">
        {title || `Esperienza con ${conditionName}`}
      </h1>

      <div className="flex flex-col gap-2 mb-6">
        {username && (
          <p className="text-text-light">
            Scritta da {username}
          </p>
        )}
        <div className="flex items-center text-text-light">
          <Calendar size={14} className="mr-1" />
          <span className="text-sm">{date}</span>
        </div>
      </div>
      
      <a 
        href={`/patologia/${condition}`}
        className="block mb-6"
      >
        <Badge 
          variant="secondary" 
          className="inline-flex px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
        >
          {conditionName}
        </Badge>
      </a>

      <div className="prose prose-lg max-w-none mb-8">
        <h2 className="text-xl font-semibold mb-4">Sintomi</h2>
        <p className="whitespace-pre-wrap mb-6">{symptoms}</p>

        <h2 className="text-xl font-semibold mb-4">Esperienza</h2>
        <p className="whitespace-pre-wrap mb-8">{experience}</p>
      </div>

      <div className="mb-8">
        <CommentSection reviewId={reviewId} />
      </div>

      <div className="mb-8">
        <Link to={`/nuova-recensione?patologia=${condition}`}>
          <Button 
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
          >
            Racconta la tua Esperienza con {conditionName}
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <ReviewStats
          diagnosisDifficulty={diagnosisDifficulty}
          symptomSeverity={symptomSeverity}
          hasMedication={hasMedication}
          medicationEffectiveness={medicationEffectiveness}
          healingPossibility={healingPossibility}
          socialDiscomfort={socialDiscomfort}
        />
      </div>

      <Disclaimer condition={conditionName} />
    </div>
  );
};