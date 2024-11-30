import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { ReviewStats } from "@/components/ReviewStats";
import { CommentSection } from "@/components/CommentSection";
import { Disclaimer } from "@/components/Disclaimer";

interface Review {
  id: string;
  title: string;
  condition: string;
  symptoms: string;
  experience: string;
  diagnosisDifficulty: number;
  symptomSeverity: number;
  hasMedication: boolean;
  medicationEffectiveness?: number;
  healingPossibility: number;
  socialDiscomfort: number;
  date: string;
}

// This would normally come from an API
const getReviewByTitleAndCondition = (condition: string, title: string): Review | undefined => {
  const reviews = {
    "1": {
      id: "1",
      title: "La mia esperienza con l'emicrania cronica",
      condition: "Emicrania",
      symptoms: "Forte mal di testa, sensibilità alla luce, nausea, vertigini",
      experience: "Ho iniziato a soffrire di emicrania circa due anni fa. Ho provato diverse terapie farmacologiche e cambiamenti nello stile di vita. La situazione è migliorata ma non sono ancora completamente guarito.",
      diagnosisDifficulty: 4,
      symptomSeverity: 5,
      hasMedication: true,
      medicationEffectiveness: 3,
      healingPossibility: 2,
      socialDiscomfort: 4,
      date: "2024-02-20"
    },
    "2": {
      id: "2",
      title: "Recensione 1",
      condition: "Depressione",
      symptoms: "Stanchezza cronica, mancanza di interesse, disturbi del sonno",
      experience: "La mia esperienza con la depressione è iniziata gradualmente. All'inizio non mi rendevo conto di cosa stesse succedendo, ma con il tempo i sintomi sono diventati più evidenti.",
      diagnosisDifficulty: 3,
      symptomSeverity: 4,
      hasMedication: true,
      medicationEffectiveness: 4,
      healingPossibility: 3,
      socialDiscomfort: 5,
      date: "2024-02-19"
    }
  };
  
  // Find review by matching condition and title (in a real app, this would be a DB query)
  return Object.values(reviews).find(
    review => 
      review.condition.toLowerCase() === condition.toLowerCase() &&
      review.title.toLowerCase().replace(/\s+/g, '-') === title.toLowerCase().replace(/\s+/g, '-')
  );
};

const ReviewDetail = () => {
  const { condition, title } = useParams();
  const review = getReviewByTitleAndCondition(condition || "", title || "");

  if (!review) {
    return <div className="container mx-auto px-4 py-8">Recensione non trovata</div>;
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
            <h1 className="text-2xl font-bold text-text">{review.title}</h1>
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
            <section>
              <h2 className="text-lg font-semibold mb-2">Sintomi</h2>
              <p className="text-text-light">{review.symptoms}</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Esperienza</h2>
              <p className="text-text-light">{review.experience}</p>
            </section>

            <ReviewStats
              diagnosisDifficulty={review.diagnosisDifficulty}
              symptomSeverity={review.symptomSeverity}
              hasMedication={review.hasMedication}
              medicationEffectiveness={review.medicationEffectiveness}
              healingPossibility={review.healingPossibility}
              socialDiscomfort={review.socialDiscomfort}
            />

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
