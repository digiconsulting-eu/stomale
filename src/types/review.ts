export interface Review {
  id: number;
  title: string;
  condition_id?: number;
  status?: string;
  created_at?: string;
  symptoms?: string;
  experience?: string;
  PATOLOGIE?: {
    Patologia: string;
  };
  users?: {
    username: string;
  };
}