import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Disclaimer } from "@/components/Disclaimer";
import { ConditionOverview } from "@/components/condition/ConditionOverview";
import { supabase } from "@/integrations/supabase/client";
import { ConditionHeader } from "@/components/condition/ConditionHeader";
import { ConditionActions } from "@/components/condition/ConditionActions";
import { ConditionReviews } from "@/components/condition/ConditionReviews";
import { capitalizeFirstLetter } from "@/utils/textUtils";
import { toast } from "sonner";
import { setPageTitle } from "@/utils/pageTitle";

interface DatabaseReview {
  id: number;
  condition_id: number;
  title: string;
  experience: string;
  created_at: string;
  symptoms: string;
  diagnosis_difficulty: number;
  symptoms_severity: number;
  has_medication: boolean;
  medication_effectiveness: number;
  healing_possibility: number;
  social_discomfort: number;
  user_id: string;
}

interface Review extends Omit<DatabaseReview, 'condition_id'> {
  condition: string;
}

interface Stats {
  diagnosisDifficulty: number;
  symptomsDiscomfort: number;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

const calculateStats = (reviews: Review[]): Stats => {
  if (!reviews.length) {
    return {
      diagnosisDifficulty: 0,
      symptomsDiscomfort: 0,
      medicationEffectiveness: 0,
      healingPossibility: 0,
      socialDiscomfort: 0
    };
  }

  const sum = reviews.reduce((acc, review) => ({
    diagnosisDifficulty: acc.diagnosisDifficulty + review.diagnosis_difficulty,
    symptomsDiscomfort: acc.symptomsDiscomfort + review.symptoms_severity,
    medicationEffectiveness: acc.medicationEffectiveness + (review.has_medication ? review.medication_effectiveness : 0),
    healingPossibility: acc.healingPossibility + review.healing_possibility,
    socialDiscomfort: acc.socialDiscomfort + review.social_discomfort
  }), {
    diagnosisDifficulty: 0,
    symptomsDiscomfort: 0,
    medicationEffectiveness: 0,
    healingPossibility: 0,
    socialDiscomfort: 0
  });

  const medicatedReviews = reviews.filter(r => r.has_medication).length;

  return {
    diagnosisDifficulty: sum.diagnosisDifficulty / reviews.length,
    symptomsDiscomfort: sum.symptomsDiscomfort / reviews.length,
    medicationEffectiveness: medicatedReviews ? sum.medicationEffectiveness / medicatedReviews : 0,
    healingPossibility: sum.healingPossibility / reviews.length,
    socialDiscomfort: sum.socialDiscomfort / reviews.length
  };
};

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
    if (condition) {
      setPageTitle(`${capitalizeFirstLetter(condition)} - StoMale.info`);
    }
  }, [condition]);

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
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", patologiaData?.id],
    enabled: !!patologiaData?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('condition_id', patologiaData.id);
      
      if (error) throw error;
      return data as DatabaseReview[];
    }
  });

  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNewReview = () => {
    navigate(`/nuova-recensione?patologia=${condition}`);
  };

  const reviews = reviewsData?.map(review => ({
    ...review,
    condition: condition || ''
  })) || [];

  const stats = calculateStats(reviews);

  return (
    <div className="container py-8">
      <ConditionHeader 
        condition={condition || ''} 
        conditionId={patologiaData?.id || 0}
      />

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
          <ConditionActions
            condition={condition || ''}
            onNavigate={handleNavigate}
            onNewReview={handleNewReview}
          />

          <div id="overview" className="mt-8">
            <ConditionOverview 
              condition={condition || ''} 
              isAdmin={isAdmin}
            />
          </div>

          <div id="experiences" className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              Esperienze ({reviews?.length || 0})
            </h2>
            <ConditionReviews
              reviews={reviews}
              isLoading={isLoading}
              condition={condition || ''}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer condition={capitalizeFirstLetter(condition || '')} />
      </div>
    </div>
  );
}
