export interface Review {
  id: string;
  condition: string;
  title?: string;
  symptoms?: string;
  experience?: string;
  diagnosisDifficulty?: number;
  symptomsDiscomfort?: number;
  medicationEffectiveness?: number;
  healingPossibility?: number;
  socialDiscomfort?: number;
  date?: string;
  username?: string;
  status?: string;
}