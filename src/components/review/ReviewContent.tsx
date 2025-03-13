
import { Disclaimer } from "@/components/Disclaimer";
import { CommentSection } from "@/components/comments/CommentSection";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ReviewMainContent } from "./ReviewMainContent";
import { ReviewActions } from "./ReviewActions";
import { RelatedReviews } from "./RelatedReviews";

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
  likesCount?: number;
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
  username,
  likesCount = 0
}: ReviewContentProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link 
          to={`/patologia/${condition.toLowerCase()}`}
          className="inline-flex items-center text-primary hover:text-primary/80 mb-6 text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alle recensioni di {condition.toUpperCase()}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <ReviewMainContent 
              title={title}
              condition={condition}
              date={date}
              symptoms={symptoms}
              experience={experience}
              diagnosisDifficulty={diagnosisDifficulty}
              symptomSeverity={symptomSeverity}
              hasMedication={hasMedication}
              medicationEffectiveness={medicationEffectiveness}
              healingPossibility={healingPossibility}
              socialDiscomfort={socialDiscomfort}
              reviewId={reviewId}
              username={username}
              likesCount={likesCount}
            />

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <CommentSection reviewId={reviewId} showBottomButton={true} />
            </div>

            <ReviewActions condition={condition} />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8">
              <Disclaimer condition={capitalizeFirstLetter(condition)} />
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <RelatedReviews condition={condition} reviewId={reviewId} />
          </div>
        </div>
      </div>
    </div>
  );
};
