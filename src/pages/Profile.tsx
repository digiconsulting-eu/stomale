
import { Session } from '@supabase/supabase-js';

interface ProfileProps {
  session: Session;
}

const Profile = ({ session }: ProfileProps) => {
  return (
    <div className="container mx-auto px-4">
      <h1>Profilo</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
};

export default Profile;
