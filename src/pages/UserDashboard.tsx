import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { FavoritesTab } from "@/components/dashboard/FavoritesTab";
import { Badge } from "@/components/ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "reviews"
  );

  // Add auth check
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  // Fetch reviews only if we have a session
  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['user-reviews', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return [];

      console.log('Starting to fetch user reviews...');
      
      // First get the user's username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      if (!userData?.username) {
        console.log('No username found for user');
        return [];
      }

      // Then fetch reviews using username
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          title,
          experience,
          diagnosis_difficulty,
          symptoms_severity,
          has_medication,
          medication_effectiveness,
          healing_possibility,
          social_discomfort,
          status,
          created_at,
          username,
          condition:PATOLOGIE (
            id,
            Patologia
          )
        `)
        .eq('username', userData.username)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!session?.user, // Only run query if we have a session
  });

  // Redirect to login if no session
  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate('/login');
    }
  }, [session, isSessionLoading, navigate]);

  // Show loading state while checking auth
  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If we're not loading and have no session, don't render anything (redirect will happen)
  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reviews">Le mie recensioni</TabsTrigger>
          <TabsTrigger value="favorites">Patologie seguite</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          <TabsTrigger value="profile">Profilo</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {isReviewsLoading ? (
            <p className="text-gray-500">Caricamento recensioni...</p>
          ) : reviews?.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-gray-500">Non hai ancora scritto recensioni.</p>
              <Button 
                onClick={() => navigate('/nuova-recensione')}
                className="text-xl py-6 px-8 text-white"
              >
                Racconta la tua Esperienza
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews?.map((review) => (
                <div key={review.id} className="relative">
                  <ReviewCard
                    id={review.id}
                    title={review.title}
                    condition={review.condition.Patologia}
                    date={new Date(review.created_at).toLocaleDateString()}
                    preview={review.experience.slice(0, 200) + '...'}
                    username={review.username || 'Anonimo'}
                  />
                  {review.status === 'pending' && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2"
                    >
                      In attesa di approvazione
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          <FavoritesTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;