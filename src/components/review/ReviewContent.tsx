
import { ReviewMainContent } from "./ReviewMainContent";

interface ReviewContentProps {
  username?: string;
  title: string;
  condition: string;
  symptoms: string;
  experience: string;
  diagnosisDifficulty: number;
  symptomSeverity: number;
  hasMedication: boolean;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
  reviewId: string;
  date: string;
  likesCount: number;
}

export const ReviewContent = ({
  username,
  title,
  condition,
  symptoms,
  experience,
  diagnosisDifficulty,
  symptomSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort,
  reviewId,
  date,
  likesCount
}: ReviewContentProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <ReviewMainContent
          username={username}
          title={title}
          condition={condition}
          symptoms={symptoms}
          experience={experience}
          diagnosisDifficulty={diagnosisDifficulty}
          symptomSeverity={symptomSeverity}
          hasMedication={hasMedication}
          medicationEffectiveness={medicationEffectiveness}
          healingPossibility={healingPossibility}
          socialDiscomfort={socialDiscomfort}
          reviewId={reviewId}
          date={date}
          likesCount={likesCount}
        />
      </div>
    </div>
  );
};
