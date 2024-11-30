import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/components/ReviewCard";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConditionDetail() {
  const { condition } = useParams();
  const navigate = useNavigate();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", condition],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: "1",
          title: "La mia esperienza con l'emicrania",
          author: "Mario Rossi",
          date: "2024-01-15",
          preview: "Ho sofferto di emicrania per anni...",
          condition: condition || "",
          rating: 4,
          helpful: 12
        },
        {
          id: "2",
          title: "Finalmente ho trovato la cura giusta",
          author: "Laura Bianchi",
          date: "2024-01-10",
          preview: "Dopo tanti tentativi...",
          condition: condition || "",
          rating: 5,
          helpful: 8
        }
      ];
    }
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">{condition}</h1>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Statistics Box - Left Column */}
        <div className="md:col-span-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Statistiche</h2>
            <div className="space-y-6">
              <StatItem label="Difficoltà diagnosi" value={4.2} description="Media" />
              <StatItem label="Fastidio sintomi" value={3.8} description="Moderato" />
              <StatItem label="Possibilità di guarigione" value={3.5} description="Media" />
              <StatItem label="Efficacia cure" value={4.0} description="Buona" />
              <StatItem label="Impatto sulla vita" value={3.9} description="Significativo" />
              <StatItem label="Costo cure" value={3.2} description="Moderato" />
              <StatItem label="Supporto medico" value={4.1} description="Buono" />
              <StatItem label="Tempo diagnosi" value={3.4} description="Medio" />
            </div>
          </Card>
        </div>

        {/* Action Buttons - Right Column */}
        <div className="md:col-span-8">
          <div className="grid gap-4">
            <Button 
              variant="default"
              size="lg"
              className="w-full text-lg py-6"
              onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Panoramica
            </Button>
            
            <Button 
              variant="secondary"
              size="lg"
              className="w-full text-lg py-6"
              onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Leggi Esperienze
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="w-full text-lg py-6"
              onClick={() => navigate(`/nuova-recensione?patologia=${condition}`)}
            >
              Racconta la tua Esperienza
            </Button>
          </div>

          <div id="overview" className="mt-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cos'è {condition}?</h2>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </Card>
          </div>

          <div id="experiences" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Esperienze ({reviews?.length || 0})</h2>
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </>
              ) : (
                reviews?.map((review) => (
                  <ReviewCard 
                    key={review.id}
                    id={review.id}
                    title={review.title}
                    date={review.date}
                    preview={review.preview}
                    condition={review.condition}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for statistics items
const StatItem = ({ label, value, description }: { label: string, value: number, description: string }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">{value.toFixed(1)}</span>
      <Badge>{description}</Badge>
    </div>
  </div>
);