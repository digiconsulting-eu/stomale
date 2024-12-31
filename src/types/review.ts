export interface Review {
  id: number;
  title: string;
  condition_id?: number;
  status?: string;
  created_at?: string;
  symptoms?: string;
  experience?: string;
  username?: string;
  PATOLOGIE?: {
    Patologia: string;
  };
}