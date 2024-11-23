import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface Review {
  id: string;
  title: string;
  condition: string;
  content: string;
  date: string;
  symptoms: string;
  treatment: string;
}

// This would normally come from an API
const getReview = (id: string): Review | undefined => {
  const reviews = {
    "1": {
      id: "1",
      title: "La mia esperienza con l'emicrania cronica",
      condition: "Emicrania",
      content: "Ho iniziato a soffrire di emicrania circa due anni fa. I sintomi principali includono forte mal di testa, sensibilità alla luce e nausea. Ho provato diverse terapie farmacologiche e cambiamenti nello stile di vita...",
      date: "2024-02-20",
      symptoms: "Forte mal di testa, sensibilità alla luce, nausea",
      treatment: "Terapia farmacologica e cambiamenti nello stile di vita"
    },
    // ... altri review objects
  };
  
  return reviews[id as keyof typeof reviews];
};

const ReviewDetail = () => {
  const { id } = useParams();
  const review = getReview(id || "");

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
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-secondary rounded-full text-sm text-text-light">
              {review.condition}
            </span>
          </div>
          <div className="prose max-w-none">
            <h2 className="text-lg font-semibold mb-2">Sintomi</h2>
            <p className="mb-4">{review.symptoms}</p>
            
            <h2 className="text-lg font-semibold mb-2">Trattamento</h2>
            <p className="mb-4">{review.treatment}</p>
            
            <h2 className="text-lg font-semibold mb-2">Esperienza Dettagliata</h2>
            <p className="mb-8">{review.content}</p>
          </div>
        </div>
      </Card>

      <div className="bg-secondary/20 rounded-lg p-6 mb-8">
        <p className="text-lg mb-4">
          Vuoi leggere esperienze di altri utenti su {review.condition}?{" "}
          <Link to={`/patologia/${review.condition.toLowerCase()}`} className="text-primary hover:underline">
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