import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { ReviewStats } from "@/components/ReviewStats";
import { CommentSection } from "@/components/CommentSection";
import { Disclaimer } from "@/components/Disclaimer";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  title: string;
  condition: string;
  symptoms?: string;
  experience: string;
  diagnosisDifficulty?: number;
  symptomsDiscomfort?: number;
  medicationEffectiveness?: number;
  healingPossibility?: number;
  socialDiscomfort?: number;
  date: string;
  username?: string;
  hasMedication?: boolean;
}

const ReviewDetail = () => {
  const { condition, title } = useParams();
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const decodedTitle = decodeURIComponent(title || '');
    const foundReview = reviews.find((r: Review) => {
      const reviewTitle = r.title || `Esperienza con ${capitalizeFirstLetter(r.condition)}`;
      const reviewTitleSlug = reviewTitle.toLowerCase().replace(/\s+/g, '-');
      return r.condition.toLowerCase() === condition?.toLowerCase() &&
             reviewTitleSlug === decodedTitle;
    });
    setReview(foundReview || null);
  }, [condition, title]);

  if (!review) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-text mb-4">Recensione non trovata</h1>
          <p className="text-text-light mb-4">
            La recensione che stai cercando non esiste o è stata rimossa.
          </p>
          <Link 
            to="/recensioni"
            className="text-primary hover:underline"
          >
            Torna alle recensioni
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary/10 rounded-lg p-6 mb-8">
        <p className="text-lg font-medium text-primary text-center">
          Vuoi leggere altre recensioni su {capitalizeFirstLetter(review.condition)}?{" "}
          <Link 
            to={`/patologia/${review.condition.toLowerCase()}`} 
            className="text-primary hover:underline font-bold"
          >
            Clicca qui
          </Link>
        </p>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-text">
              {review.title || `Esperienza con ${capitalizeFirstLetter(review.condition)}`}
            </h1>
            <span className="text-sm text-text-light">{review.date}</span>
          </div>
          
          <div className="mb-6">
            <Link 
              to={`/patologia/${review.condition.toLowerCase()}`}
              className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              {capitalizeFirstLetter(review.condition)}
            </Link>
          </div>

          <div className="space-y-6">
            {review.symptoms && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Sintomi</h2>
                <p className="text-text-light">{review.symptoms}</p>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold mb-2">Esperienza</h2>
              <p className="text-text-light whitespace-pre-wrap">{review.experience}</p>
            </section>

            {(review.diagnosisDifficulty || review.symptomsDiscomfort || 
              review.medicationEffectiveness || review.healingPossibility || 
              review.socialDiscomfort) && (
              <ReviewStats
                diagnosisDifficulty={review.diagnosisDifficulty || 0}
                symptomSeverity={review.symptomsDiscomfort || 0}
                medicationEffectiveness={review.medicationEffectiveness || 0}
                healingPossibility={review.healingPossibility || 0}
                socialDiscomfort={review.socialDiscomfort || 0}
                hasMedication={review.hasMedication || false}
              />
            )}

            <CommentSection />
          </div>
        </div>
      </Card>

      <div className="bg-primary/10 rounded-lg p-6 mb-8">
        <p className="text-lg font-medium text-primary text-center">
          Vuoi leggere altre recensioni su {capitalizeFirstLetter(review.condition)}?{" "}
          <Link 
            to={`/patologia/${review.condition.toLowerCase()}`} 
            className="text-primary hover:underline font-bold"
          >
            Clicca qui
          </Link>
        </p>
      </div>

      <Disclaimer condition={review.condition} />
    </div>
  );
};

export default ReviewDetail;