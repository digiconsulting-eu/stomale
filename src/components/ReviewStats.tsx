import { Square } from "lucide-react";

interface ReviewStatsProps {
  diagnosisDifficulty: number;
  symptomSeverity: number;
  hasMedication: boolean;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

const StatSquare = ({ value, label }: { value: number; label: string }) => (
  <div className="space-y-2">
    <div className="w-full aspect-square bg-primary/10 rounded-lg flex items-center justify-center text-xl font-semibold text-primary">
      {value}
    </div>
    <p className="text-sm text-text-light text-center">{label}</p>
  </div>
);

export const ReviewStats = ({
  diagnosisDifficulty,
  symptomSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort,
}: ReviewStatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatSquare 
        value={diagnosisDifficulty} 
        label="Difficoltà Diagnosi" 
      />
      <StatSquare 
        value={symptomSeverity} 
        label="Fastidio Sintomi" 
      />
      {hasMedication && (
        <StatSquare 
          value={medicationEffectiveness} 
          label="Efficacia Farmaci" 
        />
      )}
      <StatSquare 
        value={healingPossibility} 
        label="Possibilità Guarigione" 
      />
      <StatSquare 
        value={socialDiscomfort} 
        label="Disagio Sociale" 
      />
    </div>
  );
};