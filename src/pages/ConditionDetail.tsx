import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReviewCard } from "@/components/ReviewCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { Disclaimer } from "@/components/Disclaimer";
import { ConditionOverview } from "@/components/condition/ConditionOverview";
import { supabase } from "@/integrations/supabase/client";

const StatItem = ({ label, value, description }: { label: string, value: number, description: string }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">{value.toFixed(1)}</span>
      <Badge variant="secondary" className="border border-primary/50 text-text">
        {description}
      </Badge>
    </div>
  </div>
);

const getDescriptionForValue = (value: number): string => {
  if (value === 0) return "Nessun dato";
  if (value <= 2) return "Basso";
  if (value <= 3.5) return "Moderato";
  return "Alto";
};

export default function ConditionDetail() {
  const { condition } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteConditions') || '[]');
    setIsFavorite(favorites.includes(condition));
  }, [condition]);

  const toggleFavorite = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      toast.error("Devi effettuare l'accesso per salvare le patologie preferite");
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favoriteConditions') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((fav: string) => fav !== condition);
      toast.success("Patologia rimossa dai preferiti");
    } else {
      newFavorites = [...favorites, condition];
      toast.success("Patologia aggiunta ai preferiti");
    }
    
    localStorage.setItem('favoriteConditions', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  // Query per ottenere l'ID della patologia
  const { data: patologiaData } = useQuery({
    queryKey: ["patologia", condition],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('PATOLOGIE')
        .select('id')
        .eq('Patologia', condition?.toUpperCase())
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Query per ottenere le recensioni
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", patologiaData?.id],
    enabled: !!patologiaData?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('RECENSIONI')
        .select('*')
        .eq('Patologia', patologiaData.id);
      
      if (error) throw error;
      return data;
    }
  });

  const calculateStats = () => {
    if (!reviews || reviews.length === 0) {
      return {
        diagnosisDifficulty: 0,
        symptomsDiscomfort: 0,
        medicationEffectiveness: 0,
        healingPossibility: 0,
        socialDiscomfort: 0
      };
    }

    const sum = reviews.reduce((acc, review) => ({
      diagnosisDifficulty: acc.diagnosisDifficulty + (Number(review["Difficoltà diagnosi"]) || 0),
      symptomsDiscomfort: acc.symptomsDiscomfort + (Number(review["Fastidio sintomi"]) || 0),
      medicationEffectiveness: acc.medicationEffectiveness + (Number(review["Efficacia farmaci"]) || 0),
      healingPossibility: acc.healingPossibility + (Number(review["Possibilità guarigione"]) || 0),
      socialDiscomfort: acc.socialDiscomfort + (Number(review["Disagio sociale"]) || 0)
    }), {
      diagnosisDifficulty: 0,
      symptomsDiscomfort: 0,
      medicationEffectiveness: 0,
      healingPossibility: 0,
      socialDiscomfort: 0
    });

    const count = reviews.length;
    return {
      diagnosisDifficulty: sum.diagnosisDifficulty / count,
      symptomsDiscomfort: sum.symptomsDiscomfort / count,
      medicationEffectiveness: sum.medicationEffectiveness / count,
      healingPossibility: sum.healingPossibility / count,
      socialDiscomfort: sum.socialDiscomfort / count
    };
  };

  const stats = calculateStats();

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">{capitalizeFirstLetter(condition || '')}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFavorite}
          className={`${isFavorite ? 'text-primary' : 'text-gray-400'} hover:text-primary`}
        >
          <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Statistiche</h2>
            <div className="space-y-6">
              <StatItem 
                label="Difficoltà di Diagnosi" 
                value={stats.diagnosisDifficulty} 
                description={getDescriptionForValue(stats.diagnosisDifficulty)} 
              />
              <StatItem 
                label="Fastidio Sintomi" 
                value={stats.symptomsDiscomfort} 
                description={getDescriptionForValue(stats.symptomsDiscomfort)} 
              />
              <StatItem 
                label="Efficacia Cura Farmacologica" 
                value={stats.medicationEffectiveness} 
                description={getDescriptionForValue(stats.medicationEffectiveness)} 
              />
              <StatItem 
                label="Possibilità di Guarigione" 
                value={stats.healingPossibility} 
                description={getDescriptionForValue(stats.healingPossibility)} 
              />
              <StatItem 
                label="Disagio Sociale" 
                value={stats.socialDiscomfort} 
                description={getDescriptionForValue(stats.socialDiscomfort)} 
              />
            </div>
          </Card>
        </div>

        <div className="md:col-span-8">
          <div className="grid gap-4">
            <Button 
              className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Panoramica
            </Button>
            
            <Button 
              className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Leggi Esperienze
            </Button>
            
            <Button 
              className="w-full text-lg py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
              onClick={() => navigate(`/nuova-recensione?patologia=${condition}`)}
            >
              Racconta la tua Esperienza
            </Button>
          </div>

          <div id="overview" className="mt-8">
            <ConditionOverview condition={condition || ''} isAdmin={isAdmin} />
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
                    title={review.Titolo}
                    date={review.Data}
                    preview={review.Esperienza}
                    condition={condition || ''}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(condition || '')} />
      </div>
    </div>
  );
}