import { useParams, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      {/* Tabs */}
      <Tabs defaultValue="description" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="description">Descrizione</TabsTrigger>
          <TabsTrigger value="experiences">Leggi Esperienze</TabsTrigger>
          <TabsTrigger value="share">Racconta la tua Esperienza</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Cos'è {decodedCondition}?</h2>
            <p className="text-text-light mb-6">
              [Descrizione della patologia da inserire]
            </p>
            <Button asChild>
              <Link to="#experiences">Leggi le Esperienze</Link>
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="experiences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_REVIEWS.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="share">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Condividi la tua esperienza con {decodedCondition}
            </h2>
            <p className="text-text-light mb-6">
              La tua esperienza può essere di grande aiuto per altre persone che stanno
              affrontando questa patologia.
            </p>
            <Button asChild>
              <Link
                to={`/nuova-recensione?condition=${encodeURIComponent(
                  decodedCondition
                )}`}
              >
                Scrivi la tua Esperienza
              </Link>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConditionDetail;