import { Disclaimer } from "@/components/Disclaimer";
import { CommentSection } from "@/components/CommentSection";
import { ReviewStats } from "@/components/ReviewStats";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewBody } from "./ReviewBody";
import { ReviewActions } from "./ReviewActions";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "@/components/ReviewCard";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
  // Fetch other reviews for the same condition
  const { data: otherReviews } = useQuery({
    queryKey: ['condition-reviews', condition],
    queryFn: async () => {
      console.log('Fetching other reviews for condition:', condition);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          username,
          created_at,
          PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('status', 'approved')
        .neq('id', parseInt(reviewId))
        .limit(5);

      if (error) {
        console.error('Error fetching other reviews:', error);
        throw error;
      }

      console.log('Fetched other reviews:', data);
      return data;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link 
        to={`/patologia/${condition.toLowerCase()}`}
        className="inline-flex items-center text-primary hover:text-primary/80 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Leggi tutte le recensioni su {condition.toUpperCase()}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-1 lg:col-span-8">
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
        
        {/* Right column with other reviews */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <h3 className="text-xl font-semibold mb-4">Altre esperienze su {condition.toUpperCase()}</h3>
          {otherReviews?.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              title={review.title}
              condition={condition}
              date={new Date(review.created_at).toLocaleDateString()}
              preview={review.experience.slice(0, 150) + '...'}
              username={review.username}
            />
          ))}
        </div>
      </div>
    </div>
  );
};