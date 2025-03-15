
export interface Comment {
  id: number;
  content: string;
  created_at: string;
  status: string;
  user_id: string;
  users?: {
    username: string;
  };
}

export interface CommentSectionProps {
  reviewId: string;
  showBottomButton?: boolean;
}
