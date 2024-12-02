import { useParams, Link } from "react-router-dom";
import { ReviewCard } from "@/components/ReviewCard";
import { ConditionOverview } from "@/components/condition/ConditionOverview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, PenSquare } from "lucide-react";
import { ReviewStats } from "@/components/ReviewStats";
import { Badge } from "@/components/ui/badge";

const ConditionDetail = () => {
  const { condition } = useParams();
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const decodedCondition = condition ? decodeURIComponent(condition).toUpperCase() : '';

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews', decodedCondition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('RECENSIONI')
        .select('*')
        .eq('condition (patologia)', decodedCondition)
        .order('"date (data)"', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Calculate average ratings
  const averageRatings = reviews.reduce((acc, review) => {
    acc.diagnosisDifficulty += review["diagnosisDifficulty (difficoltà diagnosi)"] || 0;
    acc.symptomsDiscomfort += review["symptomsDiscomfort (fastidio sintomi)"] || 0;
    acc.medicationEffectiveness += review["medicationEffectiveness (efficacia farmaci)"] || 0;
    acc.healingPossibility += review["healingPossibility (possibilità guarigione)"] || 0;
    acc.socialDiscomfort += review["socialDiscomfort (disagio sociale)"] || 0;
    return acc;
  }, {
    diagnosisDifficulty: 0,
    symptomsDiscomfort: 0,
    medicationEffectiveness: 0,
    healingPossibility: 0,
    socialDiscomfort: 0
  });

  const reviewCount = reviews.length;
  if (reviewCount > 0) {
    Object.keys(averageRatings).forEach(key => {
      averageRatings[key] = Math.round((averageRatings[key] / reviewCount) * 10) / 10;
    });
  }

  if (!condition) {
    return <div>Patologia non trovata</div>;
  }

  const getRatingLabel = (value: number) => {
    if (value >= 4) return "Alta";
    if (value >= 3) return "Moderata";
    if (value >= 2) return "Media";
    return "Bassa";
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          {capitalizeFirstLetter(decodedCondition)}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <PenSquare className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Statistics Sidebar */}
        <div className="md:col-span-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Statistiche</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-light">Difficoltà di Diagnosi</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{averageRatings.diagnosisDifficulty}</span>
                    <Badge variant="secondary">{getRatingLabel(averageRatings.diagnosisDifficulty)}</Badge>
                  </div>
                </div>
                <ReviewStats diagnosisDifficulty={averageRatings.diagnosisDifficulty} readOnly />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-light">Fastidio Sintomi</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{averageRatings.symptomsDiscomfort}</span>
                    <Badge variant="secondary">{getRatingLabel(averageRatings.symptomsDiscomfort)}</Badge>
                  </div>
                </div>
                <ReviewStats symptomsDiscomfort={averageRatings.symptomsDiscomfort} readOnly />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-light">Efficacia Cura Farmacologica</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{averageRatings.medicationEffectiveness}</span>
                    <Badge variant="secondary">{getRatingLabel(averageRatings.medicationEffectiveness)}</Badge>
                  </div>
                </div>
                <ReviewStats medicationEffectiveness={averageRatings.medicationEffectiveness} readOnly />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-light">Possibilità di Guarigione</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{averageRatings.healingPossibility}</span>
                    <Badge variant="secondary">{getRatingLabel(averageRatings.healingPossibility)}</Badge>
                  </div>
                </div>
                <ReviewStats healingPossibility={averageRatings.healingPossibility} readOnly />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-light">Disagio Sociale</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold">{averageRatings.socialDiscomfort}</span>
                    <Badge variant="secondary">{getRatingLabel(averageRatings.socialDiscomfort)}</Badge>
                  </div>
                </div>
                <ReviewStats socialDiscomfort={averageRatings.socialDiscomfort} readOnly />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">Panoramica</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Leggi Esperienze</TabsTrigger>
              <TabsTrigger value="share" className="flex-1">Racconta la tua Esperienza</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ConditionOverview condition={decodedCondition} isAdmin={isAdmin} />
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                {isLoadingReviews ? (
                  <p>Caricamento recensioni...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      id={review.id}
                      title={review["title (titolo)"]}
                      condition={review["condition (patologia)"]}
                      experience={review["experience (esperienza)"]}
                      date={review["date (data)"]}
                      username={review["username (nome utente)"]}
                    />
                  ))
                ) : (
                  <p className="text-text-light">
                    Non ci sono ancora recensioni per questa patologia.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="share">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Condividi la tua Esperienza</h3>
                <p className="text-text-light">
                  Aiuta altre persone condividendo la tua esperienza con {capitalizeFirstLetter(decodedCondition)}.
                </p>
                <Button asChild className="mt-4">
                  <Link to={`/nuova-recensione?patologia=${decodedCondition}`}>
                    Scrivi una Recensione
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ConditionDetail;