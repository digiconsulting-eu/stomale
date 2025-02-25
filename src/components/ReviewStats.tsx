
interface ReviewStatsProps {
  diagnosisDifficulty: number;
  symptomSeverity: number;
  hasMedication: boolean;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-gray-50 p-4 rounded-lg text-center">
    <div className="text-2xl font-bold text-primary mb-1">{value}/5</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

export const ReviewStats = ({
  diagnosisDifficulty,
  symptomSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort
}: ReviewStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatBox 
        label="Difficoltà Diagnosi" 
        value={diagnosisDifficulty}
      />
      <StatBox 
        label="Gravità Sintomi" 
        value={symptomSeverity}
      />
      {hasMedication && (
        <StatBox 
          label="Efficacia Cura" 
          value={medicationEffectiveness}
        />
      )}
      <StatBox 
        label="Possibilità Guarigione" 
        value={healingPossibility}
      />
      <StatBox 
        label="Disagio Sociale" 
        value={socialDiscomfort}
      />
    </div>
  );
};
