
import { Review } from "@/types/review";

interface Stats {
  diagnosisDifficulty: number;
  symptomsDiscomfort: number;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
}

export const calculateStats = (reviews: Review[]): Stats => {
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

export const calculateRating = (stats: Stats): number => {
  return (stats.medicationEffectiveness + (5 - stats.symptomsDiscomfort) + stats.healingPossibility) / 3;
};
