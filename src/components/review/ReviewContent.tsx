
import { Disclaimer } from "@/components/Disclaimer";
import { ReviewStats } from "@/components/ReviewStats";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewBody } from "./ReviewBody";
import { ReviewActions } from "./ReviewActions";
import { CommentSection } from "@/components/comments/CommentSection";
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
  const { data: otherReviews } = useQuery({
    queryKey: ['condition-reviews', condition],
    queryFn: async () => {
      console.log('Fetching other reviews for condition:', condition);
      const { data: patologiaData } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .eq('Patologia', condition.toUpperCase())
        .single();

      if (!patologiaData) {
        throw new Error('Condition not found');
      }

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          username,
          created_at
        `)
        .eq('condition_id', patologiaData.id)
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link 
          to={`/patologia/${condition.toLowerCase()}`}
          className="inline-flex items-center text-primary hover:text-primary/80 mb-6 text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alle recensioni di {condition.toUpperCase()}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
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
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm">
              <CommentSection reviewId={reviewId} showBottomButton={true} />
            </div>

            <ReviewActions condition={condition} />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8">
              <Disclaimer condition={capitalizeFirstLetter(condition)} />
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="col-span-1 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                Altre esperienze su {condition.toUpperCase()}
              </h3>
              <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};
