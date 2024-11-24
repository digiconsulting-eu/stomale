import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";

// Temporary mock data - replace with actual API calls
const MOCK_RATINGS = {
  diagnosisDifficulty: 4.2,
  symptomsDiscomfort: 3.8,
  drugTreatmentEffectiveness: 3.5,
  healingPossibility: 2.9,
  socialDiscomfort: 3.7,
};

const MOCK_REVIEWS = [
  {
    id: "1",
    title: "La mia esperienza con questa patologia",
    condition: "Emicrania",
    preview: "Ho iniziato a soffrire di questa patologia circa due anni fa...",
    date: "2024-02-20",
  },
  // Add more mock reviews as needed
];

const ConditionDetail = () => {
  const { condition } = useParams();
  const decodedCondition = decodeURIComponent(condition || "");

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-4xl font-bold text-primary mb-8">{decodedCondition}</h1>

      {/* Ratings Overview */}
      <Card className="p-6 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-2">Difficoltà di Diagnosi</h3>
          <StarRating value={MOCK_RATINGS.diagnosisDifficulty} readOnly />
        </div>
        <div>
          <h3 className="font-medium mb-2">Gravità dei Sintomi</h3>
          <StarRating value={MOCK_RATINGS.symptomsDiscomfort} readOnly />
        </div>
        <div>
          <h3 className="font-medium mb-2">Efficacia Cura Farmacologica</h3>
          <StarRating value={MOCK_RATINGS.drugTreatmentEffectiveness} readOnly />
        </div>
        <div>
          <h3 className="font-medium mb-2">Possibilità di Guarigione</h3>
          <StarRating value={MOCK_RATINGS.healingPossibility} readOnly />
        </div>
        <div>
          <h3 className="font-medium mb-2">Disagio Sociale</h3>
          <StarRating value={MOCK_RATINGS.socialDiscomfort} readOnly />
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button
          className="flex-1 bg-primary text-white hover:bg-primary-hover"
          onClick={() => document.getElementById("description")?.scrollIntoView({ behavior: "smooth" })}
        >
          Descrizione
        </Button>
        <Button
          className="flex-1 bg-primary text-white hover:bg-primary-hover"
          onClick={() => document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth" })}
        >
          Leggi Esperienze
        </Button>
        <Button
          className="flex-1 bg-primary text-white hover:bg-primary-hover"
          asChild
        >
          <Link to={`/nuova-recensione?condition=${encodeURIComponent(decodedCondition)}`}>
            Racconta la tua Esperienza
          </Link>
        </Button>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        <section id="description" className="scroll-mt-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Cos'è {decodedCondition}?</h2>
            <p className="text-text-light mb-6">
              [Descrizione della patologia da inserire]
            </p>
          </Card>
        </section>

        <section id="experiences" className="scroll-mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_REVIEWS.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        </section>
      </div>

      {/* Disclaimer */}
      <div className="bg-white rounded-lg p-6 mt-8 text-sm text-text-light">
        <h2 className="text-lg font-semibold mb-4">{decodedCondition}</h2>
        <p className="mb-4">
          Scopri l'esperienza di chi soffre di {decodedCondition} grazie alle recensioni ed esperienze di altri utenti.
        </p>
        <p className="mb-4">
          Su StoMale.info puoi leggere le esperienze di utenti che hanno o hanno avuto a che fare con questa patologia. 
          Puoi leggere le loro esperienze, commentarle o fare domande e scoprire quali sintomi ha o come si sta curando 
          chi soffre di {decodedCondition}. Puoi inoltre confrontarti su esperti e cure, chiedendo anche di effetti 
          positivi oppure effetti collaterali o reazioni, tenendo però presente che si tratta di esperienze individuali 
          e che quindi bisognerà sempre rivolgersi al proprio medico curante per diagnosi e cura.
        </p>
        <p className="mb-4">
          Leggi le esperienze degli utenti che soffrono di {decodedCondition} e scopri come stanno.
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

export default ConditionDetail;
