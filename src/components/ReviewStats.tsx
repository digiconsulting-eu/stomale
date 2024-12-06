import { StarRating } from "@/components/StarRating";

interface ReviewStatsProps {
  diagnosisDifficulty: number;
  symptomSeverity: number;
  hasMedication: boolean;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

export const ReviewStats = ({
  diagnosisDifficulty,
  symptomSeverity,
  hasMedication,
  medicationEffectiveness,
  healingPossibility,
  socialDiscomfort
}: ReviewStatsProps) => {
  return (
    <section className="grid grid-cols-1 gap-6">
      <div>
        <h3 className="font-medium mb-2">Difficoltà di Diagnosi</h3>
        <StarRating value={diagnosisDifficulty} readOnly onChange={() => {}} />
      </div>

      <div>
        <h3 className="font-medium mb-2">Gravità dei Sintomi</h3>
        <StarRating value={symptomSeverity} readOnly onChange={() => {}} />
      </div>

      {hasMedication && (
        <div>
          <h3 className="font-medium mb-2">Efficacia Cura Farmacologica</h3>
          <StarRating value={medicationEffectiveness} readOnly onChange={() => {}} />
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Possibilità di Guarigione</h3>
        <StarRating value={healingPossibility} readOnly onChange={() => {}} />
      </div>

      <div>
        <h3 className="font-medium mb-2">Disagio Sociale</h3>
        <StarRating value={socialDiscomfort} readOnly onChange={() => {}} />
      </div>
    </section>
  );
};