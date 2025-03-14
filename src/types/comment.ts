
export interface DatabaseComment {
  id: number;
  review_id: number;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at?: string;
  users?: {
    id?: string;
    username: string;
    email?: string;
  };
  reviews?: {
    id: number;
    title: string;
  };
}
