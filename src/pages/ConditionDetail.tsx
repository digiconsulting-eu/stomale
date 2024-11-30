import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">{condition}</h1>
        <Button 
          onClick={() => navigate(`/nuova-recensione?condition=${condition}`)}
          className="bg-primary text-white"
        >
          Racconta la tua Esperienza
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Panoramica</TabsTrigger>
              <TabsTrigger value="symptoms">Sintomi</TabsTrigger>
              <TabsTrigger value="treatments">Cure</TabsTrigger>
              <TabsTrigger value="causes">Cause</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Cos'è {condition}?</h2>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="symptoms">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sintomi principali</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Sintomo 1</li>
                  <li>Sintomo 2</li>
                  <li>Sintomo 3</li>
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="treatments">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Trattamenti disponibili</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Trattamento 1</li>
                  <li>Trattamento 2</li>
                  <li>Trattamento 3</li>
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="causes">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Cause comuni</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Causa 1</li>
                  <li>Causa 2</li>
                  <li>Causa 3</li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Statistiche</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Difficoltà diagnosi</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">4.2</span>
                  <Badge>Media</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fastidio sintomi</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">3.8</span>
                  <Badge>Moderato</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Possibilità di guarigione</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">3.5</span>
                  <Badge>Media</Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Tag correlati</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Tag 1</Badge>
              <Badge variant="secondary">Tag 2</Badge>
              <Badge variant="secondary">Tag 3</Badge>
              <Badge variant="secondary">Tag 4</Badge>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
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
  );
}
