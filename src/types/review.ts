
export interface DatabaseReview {
  id: number;
  condition_id: number;
  title: string;
  symptoms: string;
  experience: string;
  diagnosis_difficulty?: number;
  symptoms_severity?: number;
  has_medication?: boolean;
  medication_effectiveness?: number;
  healing_possibility?: number;
  social_discomfort?: number;
  status?: string;
  created_at: string;
  updated_at?: string;
  symptoms_searchable?: any;
  username?: string;
  likes_count?: number;
  comments_count?: number;
  PATOLOGIE?: {
    id: number;
    Patologia: string;
  };
}

export interface Review {
  id: number;
  title: string;
  condition: string;
  experience: string;
  diagnosis_difficulty?: number;
  symptoms_severity?: number;
  has_medication?: boolean;
  medication_effectiveness?: number;
  healing_possibility?: number;
  social_discomfort?: number;
  username: string;
  created_at: string;
  condition_id: number;
  likes_count?: number;
  comments_count?: number;
  PATOLOGIE?: {
    id: number;
    Patologia: string;
  };
}
