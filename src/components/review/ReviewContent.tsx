import { Disclaimer } from "@/components/Disclaimer";
import { CommentSection } from "@/components/CommentSection";
import { ReviewStats } from "@/components/ReviewStats";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewBody } from "./ReviewBody";
import { ReviewActions } from "./ReviewActions";
import { capitalizeFirstLetter } from "@/utils/textUtils"; // Add this import

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
  return (
    <div>
      <ReviewHeader 
        title={title}
        condition={condition}
        date={date}
        username={username}
      />

      <ReviewBody 
        symptoms={symptoms}
        experience={experience}
      />

      <div className="mb-8">
        <CommentSection reviewId={reviewId} />
      </div>

      <ReviewActions condition={condition} />

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

      <Disclaimer condition={capitalizeFirstLetter(condition)} />
    </div>
  );
};