import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { NotificationsTab } from "@/components/dashboard/NotificationsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { FavoritesTab } from "@/components/dashboard/FavoritesTab";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";

const UserDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "reviews"
  );

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['user-reviews'],
    queryFn: async () => {
      console.log('Starting to fetch user reviews...');
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return [];

      // First get the user's username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.session.user.id)
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
          condition:PATOLOGIE (
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
    }
  });

  // Update active tab when location state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

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
          {isLoading ? (
            <p className="text-gray-500">Caricamento recensioni...</p>
          ) : reviews?.length === 0 ? (
            <p className="text-gray-500">Non hai ancora scritto recensioni.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews?.map((review) => (
                <div key={review.id} className="relative">
                  <ReviewCard
                    id={review.id.toString()}
                    title={review.title}
                    condition={review.condition.Patologia}
                    experience={review.experience}
                    diagnosisDifficulty={review.diagnosis_difficulty}
                    symptomsSeverity={review.symptoms_severity}
                    hasMedication={review.has_medication}
                    medicationEffectiveness={review.medication_effectiveness}
                    healingPossibility={review.healing_possibility}
                    socialDiscomfort={review.social_discomfort}
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