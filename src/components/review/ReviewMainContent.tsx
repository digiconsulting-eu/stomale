
import { ReviewHeader } from "./ReviewHeader";
import { ReviewStats } from "@/components/ReviewStats";
import { ReviewBody } from "./ReviewBody";
import { ReviewLikeButton } from "./ReviewLikeButton";

interface ReviewMainContentProps {
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
  likesCount: number;
}

export const ReviewMainContent = ({
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
  username,
  likesCount
}: ReviewMainContentProps) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <ReviewHeader 
        title={title}
        condition={condition}
        date={date}
        username={username}
      />

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-6">Statistiche della Recensione</h3>
        <ReviewStats
          diagnosisDifficulty={diagnosisDifficulty}
          symptomSeverity={symptomSeverity}
          hasMedication={hasMedication}
          medicationEffectiveness={medicationEffectiveness}
          healingPossibility={healingPossibility}
          socialDiscomfort={socialDiscomfort}
        />
      </div>

      <div className="mt-8">
        <ReviewBody 
          symptoms={symptoms}
          experience={experience}
        />
      </div>

      <ReviewLikeButton 
        reviewId={reviewId} 
        initialLikesCount={likesCount}
      />
    </div>
  );
};
