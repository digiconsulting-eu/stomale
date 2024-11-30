import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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
  };
  
  // Find review by matching condition and title (in a real app, this would be a DB query)
  return Object.values(reviews).find(
    review => 
      review.condition.toLowerCase().replace(/\s+/g, '-') === condition &&
      review.title.toLowerCase().replace(/\s+/g, '-') === title
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
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-text">{review.title}</h1>
            <span className="text-sm text-text-light">{review.date}</span>
          </div>
          
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-secondary rounded-full text-sm text-text-light">
              {review.condition}
            </span>
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

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Difficoltà di Diagnosi</h3>
                <StarRating value={review.diagnosisDifficulty} readOnly />
              </div>

              <div>
                <h3 className="font-medium mb-2">Gravità dei Sintomi</h3>
                <StarRating value={review.symptomSeverity} readOnly />
              </div>

              {review.hasMedication && (
                <div>
                  <h3 className="font-medium mb-2">Efficacia Cura Farmacologica</h3>
                  <StarRating value={review.medicationEffectiveness || 0} readOnly />
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2">Possibilità di Guarigione</h3>
                <StarRating value={review.healingPossibility} readOnly />
              </div>

              <div>
                <h3 className="font-medium mb-2">Disagio Sociale</h3>
                <StarRating value={review.socialDiscomfort} readOnly />
              </div>
            </section>

            <div className="flex justify-end">
              <Button className="flex items-center gap-2">
                <MessageCircle size={18} />
                Commenta
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-primary/10 rounded-lg p-6 mb-8">
        <p className="text-lg font-medium text-primary">
          Vuoi leggere altre recensioni su {review.condition}?{" "}
          <Link 
            to={`/patologia/${review.condition.toLowerCase()}`} 
            className="text-primary hover:underline font-bold"
          >
            Clicca qui
          </Link>
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 text-sm text-text-light">
        <h2 className="text-lg font-semibold mb-4">{review.condition}</h2>
        <p className="mb-4">
          Scopri l'esperienza di chi soffre di {review.condition} grazie alle recensioni ed esperienze di altri utenti.
        </p>
        <p className="mb-4">
          Su StoMale.info puoi leggere le esperienze di utenti che hanno o hanno avuto a che fare con questa patologia. 
          Puoi leggere le loro esperienze, commentarle o fare domande e scoprire quali sintomi ha o come si sta curando 
          chi soffre di {review.condition}. Puoi inoltre confrontarti su esperti e cure, chiedendo anche di effetti 
          positivi oppure effetti collaterali o reazioni, tenendo però presente che si tratta di esperienze individuali 
          e che quindi bisognerà sempre rivolgersi al proprio medico curante per diagnosi e cura.
        </p>
        <p className="mb-4">
          Leggi le esperienze degli utenti che soffrono di {review.condition} e scopri come stanno.
        </p>
        <p className="mb-4">
          Gli utenti scrivono recensioni basate sulla propria esperienza personale e sotto diagnosi e consiglio medico, 
          questo sito quindi NON è inteso per consulenza medica, diagnosi o trattamento e NON deve in nessun caso 
          sostituirsi a un consulto medico, una visita specialistica o altro. StoMale.info e DigiConsulting non si 
          assumono responsabilità sulla libera interpretazione del contenuto scritto da altri utenti. E' doveroso 
          contattare il proprio medico e/o specialista per la diagnosi di malattie e per la prescrizione e assunzione 
          di farmaci.
        </p>
      </div>
    </div>
  );
};

export default ReviewDetail;