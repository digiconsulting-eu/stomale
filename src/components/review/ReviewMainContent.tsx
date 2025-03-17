
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
  // Calcolo di un rating generale basato su metriche della recensione
  const overallRating = Math.round((
    (5 - diagnosisDifficulty) + 
    (5 - symptomSeverity) + 
    (hasMedication ? medicationEffectiveness : 3) + 
    healingPossibility + 
    (5 - socialDiscomfort)
  ) / 5);

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm w-full max-w-full overflow-hidden" itemScope itemType="https://schema.org/Review">
      <meta itemProp="author" content={username || "Utente Anonimo"} />
      <meta itemProp="datePublished" content={date} />
      
      <div itemProp="itemReviewed" itemScope itemType="https://schema.org/MedicalCondition">
        <meta itemProp="name" content={condition} />
      </div>
      
      <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
        <meta itemProp="ratingValue" content={String(overallRating)} />
        <meta itemProp="bestRating" content="5" />
        <meta itemProp="worstRating" content="1" />
      </div>
      
      <ReviewHeader 
        title={title}
        condition={condition}
        date={date}
        username={username}
      />

      <div className="mt-8 overflow-x-hidden">
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

      <div className="mt-8 overflow-x-hidden" itemProp="reviewBody">
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
