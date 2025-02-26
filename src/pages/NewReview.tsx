
import { Session } from '@supabase/supabase-js';

interface NewReviewProps {
  session: Session;
}

const NewReview = ({ session }: NewReviewProps) => {
  return (
    <div className="container mx-auto px-4">
      <h1>Nuova Recensione</h1>
      <p>Utente: {session.user.email}</p>
    </div>
  );
};

export default NewReview;
