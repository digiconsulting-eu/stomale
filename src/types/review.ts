export interface DatabaseReview {
  id: number;
  condition_id: number;
  title: string;
  experience: string;
  created_at: string;
  symptoms: string;
  diagnosis_difficulty?: number;
  symptoms_severity?: number;
  has_medication?: boolean;
  medication_effectiveness?: number;
  healing_possibility?: number;
  social_discomfort?: number;
  username?: string;
  status?: string;
  PATOLOGIE?: {
    id: number;
    Patologia: string;
  };
  users?: {
    username: string;
  };
}

export interface Review extends Omit<DatabaseReview, 'condition_id' | 'users'> {
  condition: string;
  username: string; // Make username required for the frontend
}