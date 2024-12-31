import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Stats {
  diagnosisDifficulty: number;
  symptomsDiscomfort: number;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

interface StatItemProps {
  label: string;
  value: number;
  description: string;
}

const StatItem = ({ label, value, description }: StatItemProps) => (
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

export const ConditionStats = ({ stats }: { stats: Stats }) => {
  return (
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
  );
};